import { Form, Navigate, redirect } from "react-router-dom";
import styled from "styled-components";
import customFetch from "../utils/customFetch";
import { toast } from "react-toastify";
import { SubmitButton } from "../components";
import { useMyContext } from "./Layout";

export const action = async ({ request }) => {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  try {
    await customFetch.post("/auth/register", data);
    toast.success("Please, verify your email to login!");
    return redirect("/");
  } catch (error) {
    toast.error(error?.response?.data?.msg);
    return error;
  }
};

const RegisterPage = () => {
  const { user } = useMyContext();
  return (
    <Wrapper>
      {user && <Navigate to="/" replace />}
      <div className="container">
        <div className="card">
          <h2>Register</h2>
          <Form method="post" className="form">
            <input
              type="text"
              placeholder="Your name"
              name="name"
              id="name"
              required
            />
            <input
              type="email"
              placeholder="Type your email"
              name="email"
              id="email"
              required
            />
            <input
              type="password"
              autoComplete="true"
              id="password"
              placeholder="Type your password"
              name="password"
              required
            />

            <input
              type="tel"
              placeholder="Your phone number"
              name="phoneNumber"
              id="phoneNumber"
              required
            />

            <input
              type="text"
              placeholder="Your street address"
              name="street"
              id="street"
              required
            />

            <input
              type="text"
              placeholder="Your postal code"
              name="postalCode"
              id="postalCode"
              required
            />

            <input
              type="text"
              placeholder="Your city"
              name="city"
              id="city"
              required
            />

            <input
              type="text"
              placeholder="Your state"
              name="state"
              id="state"
              required
            />

            <input
              type="text"
              placeholder="Your country"
              name="country"
              id="country"
              required
            />
            <SubmitButton text="Register" loadingText="Please wait..." />
          </Form>
        </div>
      </div>
    </Wrapper>
  );
};
export default RegisterPage;

const Wrapper = styled.div``;
