import { useRouter } from "next/router";
import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import styles from "../../../styles/Form.module.css";
import { trpc } from "../../utils/trpc";
import { auth, firebase } from "../../utils/firebase";
import { GetServerSideProps } from "next";

const InitialUserData = {
  aadharId: "",
  panId: "",
  passport: "",
  driverLicenseId: "",
};

const UserLogin = () => {
  const [user, setUser] = useState(InitialUserData);

  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [confirmationOBJ, setConfimationOBJ] =
    useState<firebase.auth.ConfirmationResult | null>(null);
  const { mutateAsync: createToken } = trpc.useMutation(["kyc.create_token"]);

  const { mutateAsync: createKYC } = trpc.useMutation(["kyc.create"]);
  const router = useRouter();

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await createKYC(user);

      if (response) {
        toast.success("KYC created successfully");

        signin();
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }

    console.log(user);
  };

  const signin = () => {
    if (mobileNumber === "" || mobileNumber.length <= 10) return;

    let verify = new firebase.auth.RecaptchaVerifier("recaptcha-container");
    auth
      .signInWithPhoneNumber(mobileNumber, verify)
      .then((result) => {
        setConfimationOBJ(result);
        setIsOtpSent(true);
      })
      .catch((err) => {
        alert(err);
        window.location.reload();
      });
  };

  const ValidateOtp = () => {
    if (otp === null || confirmationOBJ === null) return;
    confirmationOBJ
      .confirm(otp)
      .then(async (result) => {
        await createToken();
        router.replace("/user/dashboard");
      })
      .catch((err) => {
        alert("Wrong code");
      });
  };

  //   async function handleWidgetClick() {
  //     const widget = window.cloudinary.createUploadWidget(
  //       {
  //         cloudName: "projectcloudat7",
  //         uploadSignature: 'at7_upload_preset',
  //         apiKey: 844666871246736,
  //         resourceType: "image",
  //       },
  //       (error, result) => {
  //         if (!error && result && result.event === "success") {
  //           console.log("Done! Here is the image info: ", result.info);
  //           setIsImageUploaded(true);
  //         } else if (error) {
  //           console.log(error);
  //         }
  //       }
  //     );
  //     widget.open();
  //   }

  return (
    <>
      <Toaster />
      <div className="flex flex-col md:flex-col min-h-screen items-center justify-center p-12 flex-wrap w-full">
        <form
          onSubmit={onSubmitHandler}
          className={
            "w-full h-full flex flex-col items-center justify-around mt-14 bg-blue-500 p-6 rounded-lg max-w-xl"
          }
        >
          {!isOtpSent ? (
            <>
              <h1 className="font-bold text-3xl py-3 text-white mb-8 text-center">
                Upload Your KYC Documents
              </h1>

              <input
                type="text"
                className={styles.input}
                placeholder="Enter Your Aadhar Number"
                onChange={(e) => {
                  setUser({ ...user, aadharId: e.target.value });
                }}
              />
              <br></br>
              <input
                type="text"
                className={styles.input}
                placeholder="Enter Your Driving License No"
                onChange={(e) => {
                  setUser({ ...user, driverLicenseId: e.target.value });
                }}
              />
              <br></br>
              <input
                type="text"
                className={styles.input}
                placeholder="Enter Your Pan Number"
                onChange={(e) => {
                  setUser({ ...user, panId: e.target.value });
                }}
              />
              <br></br>

              <input
                type="text"
                className={styles.input}
                placeholder="Enter Your Passport Number"
                onChange={(e) => {
                  setUser({ ...user, passport: e.target.value });
                }}
              />
              <br></br>

              <input
                type="text"
                className={styles.input}
                placeholder="Enter Your Mobile Number"
                onChange={(e) => {
                  setMobileNumber(e.target.value);
                }}
              />

              <br></br>

              <br />

              <button
                type="submit"
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-10 border border-gray-400 rounded shadow"
              >
                Submit
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-center flex-col">
              <h1 className="font-bold text-3xl py-3 text-white mb-8 text-center">
                ENTER THE OTP
              </h1>

              <input
                type="text"
                className={styles.input}
                placeholder="Enter The OTP"
                onChange={(e) => {
                  setOtp(e.target.value);
                }}
              />

              <button
                onClick={(e) => {
                  e.preventDefault();
                  ValidateOtp();
                }}
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-10 border mt-7 border-gray-400 rounded shadow"
              >
                Submit
              </button>
            </div>
          )}
        </form>
        <div id="recaptcha-container"></div>
        {/* <button
          type="submit"
          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 my-2 border border-gray-400 rounded shadow"
          //   onClick={() => handleWidgetClick()}
        >
          Upload files
        </button> */}
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const cookies = req.cookies;

  const kyc_token = cookies["kyc_token"];

  if (kyc_token) {
    return {
      props: {},
      redirect: {
        destination: "/user/dashboard",
      },
    };
  }

  return {
    props: {},
  };
};

export default UserLogin;
