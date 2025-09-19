export default function TestTailwind() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <h1 className="text-4xl font-bold text-white mb-4">Test Tailwind CSS</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-500 p-4 rounded">
          <p className="text-white">Blue Box</p>
        </div>
        <div className="bg-green-500 p-4 rounded">
          <p className="text-white">Green Box</p>
        </div>
        <div className="bg-red-500 p-4 rounded">
          <p className="text-white">Red Box</p>
        </div>
      </div>
      <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
        Test Button
      </button>
    </div>
  );
}