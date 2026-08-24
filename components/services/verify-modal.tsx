"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import api from "@/lib/api/axios";

import VerificationResult from "@/components/services/verification-result";

type ServiceMode =
  | "single"
  | "driving-license"
  | "bank"
  | "passport"
  | "digilocker"
  | "face-match"
  | "face-liveness"
  | "name-match"
  | "reverse-geocode"
  | "employment-360"
  | "coming-soon";

type Props = {
  open: boolean;
  onClose: () => void;
  serviceName: string;
  mode: ServiceMode;
  endpoint?: string;
  requestKey?: string;
  inputLabel?: string;
  placeholder?: string;
  defaultApiKey?: string;
};

export default function VerifyModal({
  open,
  onClose,
  serviceName,
  mode,
  endpoint,
  requestKey,
  inputLabel,
  placeholder,
  defaultApiKey = "",
}: Props) {
  const [singleValue, setSingleValue] = useState("");

  const [dlNumber, setDlNumber] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");

  const [passportFileNumber, setPassportFileNumber] = useState("");
  const [passportDob, setPassportDob] = useState("");

  const [bankAccount, setBankAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");

  const [documentRequested, setDocumentRequested] = useState("AADHAAR");
  const [userFlow, setUserFlow] = useState("signup");

  const [faceImage1, setFaceImage1] = useState<File | null>(null);
  const [faceImage2, setFaceImage2] = useState<File | null>(null);
  const [livenessImage, setLivenessImage] = useState<File | null>(null);

  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");

  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  const [employmentPhone, setEmploymentPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!open) return;
        const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);

    setSingleValue("");
    setDlNumber("");
    setDobDay("");
    setDobMonth("");
    setDobYear("");
    setPassportFileNumber("");
    setPassportDob("");
    setBankAccount("");
    setIfscCode("");
    setDocumentRequested("AADHAAR");
    setUserFlow("signup");
    setFaceImage1(null);
    setFaceImage2(null);
    setLivenessImage(null);
    setName1("");
    setName2("");
    setLatitude("");
    setLongitude("");
    setEmploymentPhone("");
    setError("");
    setResult(null);
    setVerified(false);

        return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, defaultApiKey]);

  if (!open) return null;

  const buildPayload = (): FormData | Record<string, any> | null => {
    const value = singleValue.trim();

    switch (mode) {
      case "single": {
        if (!value) {
          setError(`${inputLabel || "Value"} is required.`);
          return null;
        }

        return { [requestKey || "value"]: value };
      }

      case "driving-license": {
        if (!dlNumber.trim()) {
          setError("Driving license number is required.");
          return null;
        }

        if (!dobDay.trim() || !dobMonth.trim() || !dobYear.trim()) {
          setError("Date of birth is required.");
          return null;
        }

        return {
          dlNumber: dlNumber.trim(),
          dob: `${dobYear}-${dobMonth.padStart(2, "0")}-${dobDay.padStart(2, "0")}`,
        };
      }

      case "passport": {
        if (!passportFileNumber.trim()) {
          setError("Passport file number is required.");
          return null;
        }

        if (!passportDob) {
          setError("Passport date of birth is required.");
          return null;
        }

        return {
          fileNumber: passportFileNumber.trim(),
          dob: passportDob,
        };
      }

      case "bank": {
        if (!bankAccount.trim()) {
          setError("Bank account number is required.");
          return null;
        }

        if (!ifscCode.trim()) {
          setError("IFSC code is required.");
          return null;
        }

        return {
          bankAccount: bankAccount.trim(),
          ifsc: ifscCode.trim().toUpperCase(),
        };
      }

      case "digilocker": {
        const docs = documentRequested
          .split(",")
          .map((item) => item.trim().toUpperCase())
          .filter(Boolean);

        if (docs.length === 0) {
          setError("Please provide at least one document to request.");
          return null;
        }

        if (!userFlow.trim()) {
          setError("User flow is required.");
          return null;
        }

        return {
          document_requested: docs,
          user_flow: userFlow.trim(),
        };
      }

      case "face-match": {
        if (!faceImage1 || !faceImage2) {
          setError("Please upload both images.");
          return null;
        }

        const formData = new FormData();
        formData.append("image1", faceImage1);
        formData.append("image2", faceImage2);
        return formData;
      }

      case "face-liveness": {
        if (!livenessImage) {
          setError("Please upload an image.");
          return null;
        }

        const formData = new FormData();
        formData.append("image", livenessImage);
        return formData;
      }

      case "name-match": {
        if (!name1.trim() || !name2.trim()) {
          setError("Both names are required.");
          return null;
        }

        return {
          name1: name1.trim(),
          name2: name2.trim(),
        };
      }

      case "reverse-geocode": {
        if (!latitude.trim() || !longitude.trim()) {
          setError("Latitude and longitude are required.");
          return null;
        }

        const lat = Number(latitude.trim());
        const lng = Number(longitude.trim());

        if (Number.isNaN(lat) || Number.isNaN(lng)) {
          setError("Latitude and longitude must be valid numbers.");
          return null;
        }

        return {
          latitude: lat,
          longitude: lng,
        };
      }

      case "employment-360": {
        if (!employmentPhone.trim()) {
          setError("Mobile number is required.");
          return null;
        }

        return {
          phoneNumber: employmentPhone.trim(),
        };
      }

      case "coming-soon":
      default:
        return {};
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      if (!endpoint) {
        setError("This service is not wired to a backend endpoint yet.");
        return;
      }

      const apiKey = defaultApiKey.trim();

      if (!apiKey) {
        setError(
          "No active API key found. Please generate or activate one from your API keys page."
        );
        return;
      }

      const payload = buildPayload();
      if (!payload) return;

      const response = await api.request({
        method: "post",
        url: endpoint,
        data: payload,
        headers: {
          "x-api-key": apiKey,
        },
      });

// DigiLocker: open verification URL directly
      if (
        mode === "digilocker" &&
        response.data?.data?.url
      ) {
        window.open(
          response.data.data.url,
          "_blank",
          "noopener,noreferrer"
        );

        onClose();
        return;
      }

// All other services behave normally
      setResult(response.data);
      setVerified(true);

    } catch (err: any) {
      console.error(err);
      const response = err?.response?.data;

      const backendMessage =
        response?.message || response?.error || err?.message || "";

      const normalized = backendMessage.toLowerCase();

      const insufficientBalance =
        normalized.includes("insufficient") ||
        normalized.includes("wallet balance") ||
        normalized.includes("low balance") ||
        normalized.includes("not enough balance");

      if (insufficientBalance) {
        setError(
          "Insufficient wallet balance\nRecharge your wallet to continue."
        );
      } else {
        setError(backendMessage || "Verification failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderBody = () => {
    if (mode === "single") {
      return (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              {inputLabel || "Input"}
            </label>
            <input
              value={singleValue}
              onChange={(e) => setSingleValue(e.target.value)}
              placeholder={placeholder || "Enter value"}
              className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
            />
          </div>
        </div>
      );
    }

    if (mode === "driving-license") {
      return (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Driving License Number
            </label>
            <input
              value={dlNumber}
              onChange={(e) => setDlNumber(e.target.value)}
              placeholder="MP982022000098"
              className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Date of Birth
            </label>
            <div className="grid grid-cols-3 gap-3">
              <input
                value={dobDay}
                onChange={(e) => setDobDay(e.target.value)}
                placeholder="DD"
                maxLength={2}
                className="rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
              />
              <input
                value={dobMonth}
                onChange={(e) => setDobMonth(e.target.value)}
                placeholder="MM"
                maxLength={2}
                className="rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
              />
              <input
                value={dobYear}
                onChange={(e) => setDobYear(e.target.value)}
                placeholder="YYYY"
                maxLength={4}
                className="rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
              />
            </div>
          </div>
        </div>
      );
    }

    if (mode === "passport") {
      return (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Passport File Number
            </label>
            <input
              value={passportFileNumber}
              onChange={(e) => setPassportFileNumber(e.target.value)}
              placeholder="A1234567"
              className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Date of Birth
            </label>
            <input
              type="date"
              value={passportDob}
              onChange={(e) => setPassportDob(e.target.value)}
              className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
            />
          </div>
        </div>
      );
    }

    if (mode === "bank") {
      return (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Bank Account Number
            </label>
            <input
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="Enter Bank Account Number"
              className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              IFSC Code
            </label>
            <input
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
              placeholder="XXX0XXXXXX"
              className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
            />
          </div>
        </div>
      );
    }

    if (mode === "digilocker") {
      return (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Documents to Request
            </label>
            <input
              value={documentRequested}
              onChange={(e) => setDocumentRequested(e.target.value)}
              placeholder="AADHAAR,PAN"
              className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
            />
            <p className="mt-2 text-xs text-slate-500">
              Comma separate document names, for example AADHAAR,PAN.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              User Flow
            </label>
            <select
              value={userFlow}
              onChange={(e) => setUserFlow(e.target.value)}
              className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
            >
              <option value="signup">signup</option>
              <option value="kyc_update">kyc_update</option>
              <option value="kyc">kyc</option>
            </select>
          </div>
        </div>
      );
    }

    if (mode === "face-match") {
      return (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Reference Image 1
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFaceImage1(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Reference Image 2
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFaceImage2(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white"
            />
          </div>
        </div>
      );
    }

    if (mode === "face-liveness") {
      return (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLivenessImage(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white"
            />
          </div>
        </div>
      );
    }

    if (mode === "name-match") {
      return (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Name 1
            </label>
            <input
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Name 2
            </label>
            <input
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              placeholder="Jon Doe"
              className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
            />
          </div>
        </div>
      );
    }

    if (mode === "reverse-geocode") {
      return (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Latitude
              </label>
              <input
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="23.0225"
                className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Longitude
              </label>
              <input
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="72.5714"
                className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
              />
            </div>
          </div>
        </div>
      );
    }

    if (mode === "employment-360") {
      return (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Mobile Number
            </label>
            <input
              value={employmentPhone}
              onChange={(e) => setEmploymentPhone(e.target.value)}
              placeholder="9876543210"
              className="w-full rounded-xl border border-[#273647] bg-[#122131] px-4 py-3 text-white outline-none"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return createPortal(
    <div
  className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md"
  onClick={onClose}
>
  <div
    className="max-h-[92vh] w-[980px] overflow-y-auto rounded-xl border border-[#273647] bg-[#0D1C2D] p-6"
    onClick={(e) => e.stopPropagation()}
  >
      <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {serviceName}
            </h2>
            <p className="mt-1 text-slate-400">
              {endpoint || "Fill the form below and send it to the backend."}
            </p>
          </div>

          <button onClick={onClose} className="text-slate-300">
            <X />
          </button>
        </div>

        <div className="mt-6">{renderBody()}</div>

        {error && (
          <div
            className="
              mt-5
              whitespace-pre-line
              rounded-xl
              border
              border-amber-500/20
              bg-amber-500/10
              p-4
              text-sm
              text-amber-300
            "
          >
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6">
            <VerificationResult service={serviceName} result={result} />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          {verified ? (
            <button
              onClick={onClose}
              className="rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-500"
            >
              Done
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="rounded-xl border border-[#273647] px-5 py-3 text-white"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-xl bg-blue-600 px-5 py-3 text-white disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}