import { NextResponse } from "next/server";
import { Resend } from "resend";
import { User } from "@/lib/models/user";
import { connectDB } from "@/lib/db";
import crypto from "crypto";
import { render } from "@react-email/render";
import VerificationEmail from "@/emails/VerificationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    // Create user
    await User.create({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpiry,
    });

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;
    const emailHtml = render(
      VerificationEmail({
        verificationUrl,
        userName: name,
      })
    );

    // Send verification email
    await resend.emails.send({
      from: "RawPng <hello@rawpng.com>",
      to: email,
      subject: "Verify your email - RawPng",
      html: await emailHtml,
    });

    console.log("Verification email sent to:", email);
    console.log("Verification URL:", verificationUrl);

    return NextResponse.json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
