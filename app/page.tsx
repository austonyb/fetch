import Link from "next/link"
import { Button } from '@/components/ui/button'
// import Marquee from '@/components/ui/marquee'
export default function Home() {

  // const items = ['Dogs!', 'More Dogs!', 'Fetch!', 'Neobrutalism is rad', 'Hi mom!']

  return (
    <div className="grid items-center justify-items-center p-8">
      {/* <Marquee items={items} /> */}
      <Link href="/login">
        <Button className="w-full">Login</Button>
      </Link>
    </div>
  );
}
