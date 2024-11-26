export default function TopNav() {
  return (
    <div className="bg-fe-blue-500 border-2 shadow-md md:flex p-2 rounded-md text-white align-middle items-center justify-center mb-5">
      <div className="w-52" />
      <span className="block xs:h-0 xs:overflow-hidden xl:h-5 grow text-center">
        Getting into the Mind of AI
      </span>
      <a href="https://for.education">
        <div className="text-center bg-white rounded-md p-2 border border-black">
          <img
            src="/images/logos/full.png"
            alt="fe-logo"
            className="h-6 inline-block"
          />
        </div>
      </a>
    </div>
  );
}
