import http from "https";
import { rapidKey, D7smsKey } from "../config/vars";

export async function sendSms(patients: string[], message: string) {
  const options = {
    method: "POST",
    hostname: "d7sms.p.rapidapi.com",
    port: null,
    path: "/messages/v1/send",
    headers: {
      "x-rapidapi-key": rapidKey,
      Token: D7smsKey,
      "x-rapidapi-host": "d7sms.p.rapidapi.com",
      "Content-Type": "application/json",
    },
  };

  const req = http.request(options, function (res) {
    const chunks: any = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      const body = Buffer.concat(chunks);
      console.log(body.toString());
    });
  });

  await req.write(
    JSON.stringify({
      messages: [
        {
          channel: "sms",
          originator: "office Scheduler",
          recipients: patients,
          content: message,
          data_coding: "text",
        },
      ],
    })
  );
  req.end();
}
