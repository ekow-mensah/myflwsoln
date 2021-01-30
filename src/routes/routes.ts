import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
    buildErrorResponse,
    buildSuccessResponse,
    buildFailedResponse,
    checkForNestedRuleField,
    getFields
} from '../utils/utils';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    const response = {
        message: "My Rule-Validation API",
        status: "success",
        data: {
            name: "Ekow Yamoah Mensah",
            github: "@ekow-mensah",
            email: "ekow.y.mensah@gmail.com",
            moblie: "+233558343508"
        }
    };

    return res.status(StatusCodes.OK).json(response);
});

router.post('/validate-rule', (req: Request, res: Response) => {

    //retrieve rule and data sent from client
    const { rule, data } = req.body;

    const ruleFieldExists: boolean = checkIfRuleFieldExists(rule);
    if (!ruleFieldExists) {
        return res.status(StatusCodes.BAD_REQUEST)
            .json(buildErrorResponse("[field] is required."));
    }

    const ruleExists: boolean = checkIfRuleExists(rule);
    if (!ruleExists) {
        return res.json(buildErrorResponse("rule is required."));
    }

    const isRuleFieldValid: boolean = checkIfRuleFieldIsValid(rule);
    if (!isRuleFieldValid) {
        if (typeof rule.field === "number") {
            res.json(buildErrorResponse("rule should be an object."));
        } else {
            res.status(StatusCodes.BAD_REQUEST)
                .json(buildErrorResponse("[field] should be a|an [type]."));
        }
    }

    const results = checkIfRuleFieldExistsInData(rule, data);
    const { rootKeyExists, isNestedObject, firstKeyExists, secondKeyExists } = results;

    if (!isNestedObject) {
        if (!rootKeyExists) {
            return res.status(StatusCodes.BAD_REQUEST)
                .json(buildErrorResponse("field " + rule.field + " is missing from data."));
        }
    } else {
        let fields: Array<string> = getFields(rule.field);
        if (!firstKeyExists) {
            return res.status(StatusCodes.BAD_REQUEST)
                .json(buildErrorResponse("field " + fields[0] + " is missing from data."));
        } else if (!secondKeyExists) {
            return res.status(StatusCodes.BAD_REQUEST)
                .json(buildErrorResponse("field " + fields[1] + " is missing from data."));
        }
    }

    const isSuccessful = checkRuleAgainstCondition(rule, data);
    if (isSuccessful) {
        let message = "field " + rule.field + " successfully validated.";
        return res.status(StatusCodes.OK).json(buildSuccessResponse(message, rule, data));
    } else {
        let message = "field " + rule.field + " failed validation.";
        return res.status(StatusCodes.BAD_REQUEST).json(buildFailedResponse(message, rule, data));
    }
});


/******** HELPER FUNCTIONS *********/
const checkIfRuleExists = (rule: Object) => {
    return rule !== undefined ? true : false;
}

const checkIfRuleFieldExists = (rule: Object) => {
    
    if (rule === undefined) {
        return false;
    } else {
        return rule.hasOwnProperty("field"); 
    }
}

const checkIfRuleFieldIsValid = (rule: { field, condition, condition_value }) => {
    if (typeof rule.field === "string") return true;
    if (Array.isArray(rule.field)) return true;
    if (typeof rule.field === "object") return true;

    return false;
}

const checkIfRuleFieldExistsInData = (rule, data) => {
    let exists: boolean = true;
    let isNestedObject: boolean = false;
    let firstKeyExists: boolean = false;
    let secondKeyExists: boolean = false;

    const field = rule.field;

    if (data === undefined) {
        exists = false;
    } else if (typeof data === "object") {
        // check if the object is a nested object
        let fieldsToCheck = getFields(field);

        if (fieldsToCheck.length > 1) {
            isNestedObject = true;
        }

        if (isNestedObject) {
            /* Check if the root key exists in the data. If the first 
             * If the first key exists check if the second key also exists within the 
             * first level object. If both exist then the check passes. 
             */ 
            firstKeyExists = (data.hasOwnProperty(fieldsToCheck[0])) ? true : false;
            if (firstKeyExists) {
                secondKeyExists = (data[fieldsToCheck[0]].hasOwnProperty(fieldsToCheck[1])) ? true : false;
            }
        } else {
            if (!(field in data)) exists = false;
        }
    } 

    let results = {
        rootKeyExists: exists,
        isNestedObject: isNestedObject,
        firstKeyExists: firstKeyExists,
        secondKeyExists: secondKeyExists
    }

    return results;
}


const checkRuleAgainstCondition = (rule, data) => {
    let passed = false;
    let conditionValue = rule.condition_value;
    let isNestedRule: boolean = checkForNestedRuleField(rule.field);
    let fieldValue: any;

    if (isNestedRule) {
        let fields: Array<string> = getFields(rule.field);
        let firstObject = data[fields[0]];
        fieldValue = firstObject[fields[1]];
    } else {
        fieldValue = data[rule.field];
    }

    switch (rule.condition) {
        case "gte":
            if (fieldValue >= conditionValue) passed = true;
            break;
        case "gt":
            if (fieldValue > conditionValue) passed = true;
            break;
        case "eq":
            if (fieldValue === conditionValue) passed = true;
            break;
        case "neq":
            if (fieldValue !== conditionValue) passed = true;
            break;
        case "contains":
            if (typeof fieldValue === "number" && typeof conditionValue === "number") {
                fieldValue = fieldValue.toString();
                conditionValue = conditionValue.toString();

                if (fieldValue.includes(conditionValue)) passed = true;
            }
            if (fieldValue.includes(conditionValue)) passed = true;
            break;
    }

    return passed;
}

export { router };