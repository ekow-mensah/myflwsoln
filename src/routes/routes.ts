import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { buildErrorResponse, buildSuccessResponse } from '../utils/utils';

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

    const { rule, data } = req.body;

    const ruleExists: boolean = checkIfRuleExists(rule);
    if (!ruleExists) {
        return res.json(buildErrorResponse("rule is required."));
    }

    const ruleFieldExists: boolean = checkIfRuleFieldExists(rule);
    if (!ruleFieldExists) {
        return res.status(StatusCodes.BAD_REQUEST)
            .json(buildErrorResponse("[field] is required."));
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

    const isRuleFieldInData = checkIfRuleFieldExistsInData(rule, data);
    if (!isRuleFieldInData) {
        return res.status(StatusCodes.BAD_REQUEST)
            .json(buildErrorResponse("field " + rule.field + " is missing from data."));
    }

    const isSuccessful = checkRuleAgainstCondition(rule, data);
    if (isSuccessful) {
        let message = "field " + rule.field + " successfully validated.";
        return res.status(StatusCodes.OK).json(buildSuccessResponse(message, rule, data));
    } else {
        let message = "field " + rule.field + " failed validation.";
        return res.status(StatusCodes.BAD_REQUEST).json(buildSuccessResponse(message, rule, data));
    }
});


/******** HELPER FUNCTIONS *********/
const checkIfRuleExists = (rule: Object) => {
    return rule !== undefined ? true : false;
}

const checkIfRuleFieldExists = (rule: Object) => {
    return "field" in rule;
}

const checkIfRuleFieldIsValid = (rule: { field, condition, condition_value }) => {
    if (typeof rule.field === "string") return true;
    if (Array.isArray(rule.field)) return true;
    if (typeof rule.field === "object") return true;

    return false;
}

const checkIfRuleFieldExistsInData = (rule, data) => {
    let exists = true;

    const field = rule.field;
    if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
            console.log(field);
            console.log(data[i]);
            if (data[i] === field) {
                exists = true;
                break;
            }
        }
        exists = false;
    } else if (typeof data === "object") {
        if (!(field in data)) exists = false;
    }

    return exists;
}


const checkRuleAgainstCondition = (rule, data) => {
    let passed = false;

    let conditionValue = rule.condition_value;
    let fieldValue = data[rule.field];

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
            //TODO: fix this properly
            if (fieldValue.incldues(conditionValue)) passed = true;
            break;
    }

    return passed;
}


export { router };