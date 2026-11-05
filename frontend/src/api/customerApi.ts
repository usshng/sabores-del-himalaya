export interface RegisterCustomerRequest {
  name: string;
  address: string;
  login: string;
  password: string;
  email: string;
}

export type RegistrationError = "DUPLICATE" | "INVALID" | "UNKNOWN";

const CUSTOMERS_URL = "/api/customers";
const HTTP_BAD_REQUEST = 400;
const HTTP_CONFLICT = 409;

// Resolves when the account is created; rejects with the reason the backend gave.
export async function registerCustomer(
  request: RegisterCustomerRequest,
): Promise<void> {
  const response = await fetch(CUSTOMERS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (response.ok) {
    return;
  }
  const error: RegistrationError =
    response.status === HTTP_CONFLICT
      ? "DUPLICATE"
      : response.status === HTTP_BAD_REQUEST
        ? "INVALID"
        : "UNKNOWN";
  throw new Error(error);
}
