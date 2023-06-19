import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const res = await request.json();
    const messages = res.messages;

    const url = "https://api.openai.com/v1/chat/completions";
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    };
    const body = {
      model: "gpt-3.5-turbo",
      messages,
    };

    const { data } = await axios.post(url, body, { headers: headers });
    console.log(data);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(error, { status: 500 });
  }
}
