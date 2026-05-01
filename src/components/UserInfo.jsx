
export default function UserInfo({ user, userData })
{

    return (
        <div className="ProfileUp">
            <h3>{`${user.email.split("@")[0]} is logged in. Personal Record: ${userData?.highScore ?? "-"}`}</h3>
        </div>
    )
}
