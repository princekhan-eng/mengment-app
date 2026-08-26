const GenerateOTP = () => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const time = new Date();
    time.setMinutes(time.getMinutes() + 10);

    return { otp, time };
}

const ExpirationTime = () => {
    const time = new Date();
    time.setMinutes(time.getMinutes() + 10);
    return time;
}


export default { GenerateOTP, ExpirationTime }



