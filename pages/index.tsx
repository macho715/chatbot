
import ChatBox from '../components/ChatBox';

export default function Home() {
  return (
    <div className="min-h-screen bg-white p-10">
      <h1 className="text-3xl font-bold mb-4">MOSB 출입 도우미 챗봇</h1>
      <ChatBox />
    </div>
  );
}
