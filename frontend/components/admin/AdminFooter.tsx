export default function AdminFooter() {
  return (
    <footer className="bg-white border-t border-gray-200 rounded-lg py-4 px-6 mt-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Khojya Admin. All Rights Reserved.</p>
        <a
          href="https://codevixa.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600 transition flex items-center gap-1.5"
        >
          <span>Powered by</span>
          <span className="font-semibold text-gray-700">CodeVixa</span>
        </a>
      </div>
    </footer>
  );
}
