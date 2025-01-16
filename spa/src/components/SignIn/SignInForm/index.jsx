
import useInput from "../../hooks/useInput";


function SignInForm({getData = f => f}) {

    const [email, resetEmail] = useInput("");
    const [password, resetPassword] = useInput("");
    const [repeatPassword, resetRePassword] = useInput("");
    const [firstName, resetFirstName] = useInput("");
    const [secondName, resetSecondName] = useInput("");

    function submit(e) {
        e.preventDefault();

        if (password.value !== repeatPassword.value) {
            alert("Passwords do not match. Please try again.");
            return; // Prevent form submission if passwords don't match
        }

        getData(email.value, password.value, firstName.value, secondName.value)

        resetEmail()
        resetPassword()
        resetRePassword()
        resetFirstName()
        resetSecondName()
    }

    return (
        <>
            <form onSubmit={submit}>
                <input {...email} type={"text"} placeholder={"Email"} required/>
                <input {...password} type={"password"} placeholder={"Password"} required/>
                <input {...repeatPassword} type={"password"} placeholder={"Repeat Password"} required/>
                <input {...firstName} type={"text"} placeholder={"First Name"} required/>
                <input {...secondName} type={"text"} placeholder={"Second Name"} required/>
                <button type={"submit"}>Sign In</button>
            </form>
        </>
    )
}

export default SignInForm;