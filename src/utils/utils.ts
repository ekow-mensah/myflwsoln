export const buildErrorResponse = (message: string) => {
    const response: Object = {
        message: message,
        status: "error",
        data: null
    }
    return response;
}


export const buildSuccessResponse = (message, rule, data) => {
    let fieldValue: any = getFieldValue(rule, data);

    const response: Object = {
        message: message,
        status: "success",
        data: {
            validation: {
                error: false,
                field: rule.field,
                field_value: fieldValue,
                condition: rule.condition,
                condition_value: rule.condition_value
            }
        }
    }

    return response;
}

export const buildFailedResponse = (message, rule, data) => {
    let fieldValue: any = getFieldValue(rule, data);

    const response: Object = {
        message: message,
        status: "error",
        data: {
            validation: {
                error: true,
                field: rule.field,
                field_value: fieldValue,
                condition: rule.condition,
                condition_value: rule.condition_value
            }
        }
    }

    return response;
}

export const checkForNestedRuleField = (ruleField) =>  {
    let isNested:boolean = false;
    let fieldsToCheck = getFields(ruleField);
        
    if (fieldsToCheck.length > 1) {
        isNested = true;
    }

    return isNested;
}

export const getFields = (ruleField) =>  {
    const fields:Array<string> = ruleField.split(".");
    return fields;
}

export const getFieldValue = (rule, data) => {
    let fieldValue: any;
    let isNestedObject:boolean = checkForNestedRuleField(rule.field);
    
    if (isNestedObject) {
        let fields:Array<string> = getFields(rule.field);
        let firstObject = data[fields[0]];
        fieldValue = firstObject[fields[1]];
    } else if (data.hasOwnProperty(rule.field)) {
        fieldValue = data[rule.field];
    } else {
        fieldValue = data;
    }

    return fieldValue;
}
