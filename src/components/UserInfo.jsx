
export default function UserInfo({ user })
{
    return (
        <div className="ProfileUp">
            <h3>{user.email}</h3>
            <h2>Logged In</h2>
        </div>
    )
}
