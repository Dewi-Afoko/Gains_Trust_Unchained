import LoginForm from '../components/forms/LoginForm'

const Login = ({ setIsLoggedIn }) => {
    return (
        <div className="flex justify-center items-center h-screen bg-[#8B0000]">
            <LoginForm setIsLoggedIn={setIsLoggedIn} />
        </div>
    )
}

export default Login
