export type MailmanError = {
    title: string,
    description: string,
}

export function isMailmanError(error: any): error is MailmanError {
    return ("title" in error && "description" in error && typeof error.title === "string" && typeof error.description === "string");
}
