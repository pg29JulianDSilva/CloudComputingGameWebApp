
export default function UserInfo({ user })
{
    console.log(user);

    return (
        <div className="ProfileUp">
            <h3>{`${user.email.split("@")[0]} is logged in. Personal Record: ${user.highScore}`}</h3>
        </div>
    )
}
