import Image from "next/image"

export default function AuthHeader() {
  return (
    <div className="flex items-center justify-center">
      <Image
        src="/images/logo.svg"
        alt="ShepherdWatch Logo"
        width={240}
        height={60}
        priority
        className="object-contain"
      />
    </div>
  )
}