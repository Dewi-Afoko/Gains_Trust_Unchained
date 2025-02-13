import LoginForm from '../components/forms/LoginForm'

const Login = ({ setIsLoggedIn }) => {
    return (
        <div className="flex justify-center items-center h-screen">
            <LoginForm setIsLoggedIn={setIsLoggedIn} />
        </div>
    )
}

export default Login
