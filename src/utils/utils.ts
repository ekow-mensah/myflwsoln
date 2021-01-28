export const buildErrorResponse = (message: string) => {
    const response: Object = {
        message: message,
        status: "error",
        data: null
    }
    return response;
}


export const buildSuccessResponse = (message: string, rule: { field, condition, condition_value }, data: any) => {
    const response: Object = {
        message: message,
        status: "success",
        data: {
            validation: {
                error: false,
                field: rule.field,
                field_value: (data.hasOwnProperty(rule.field)) ? data[rule.field] : data,
                condition: rule.condition,
                condition_value: rule.condition_value
            }
        }
    }

    return response;
}

export const buildFailedResponse = (message: string, rule: { field, condition, condition_value }, data: any) => {
    const response: Object = {
        message: message,
        status: "error",
        data: {
            validation: {
                error: true,
                field: rule.field,
                field_value: (data.hasOwnProperty(rule.field)) ? data[rule.field] : data,
                condition: rule.condition,
                condition_value: rule.condition_value
            }
        }
    }

    return response;
}