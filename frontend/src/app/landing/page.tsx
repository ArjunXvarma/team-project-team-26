
import Image from "next/image";
import Link from "next/link";
import { Button } from "@mantine/core";
export default function Landing(){
    return (
        <main> 
          <div className="w-full h-full">
            <header className=" flex items-center justify-between px-16 pt-10">

                <h1 className="ml-4 text-2xl font-bold text-green-700">MyApp</h1>
                <div className="flex items-center">
                    <Link href={"/login"} className="flex w-full justify-center">
                        <button className="font-semibold text-lg">Login</button>
                    </Link>
                    <h1 className="text-lg">/</h1>
                    <Link href={"/signup"} className="flex w-full justify-center">
                        <button className="font-semibold text-lg ">SignUp</button>
                    </Link>
                </div>

            </header>
            
            <h1 className="text-center text-lg font-serif">“ Every journey begins with a single step ”</h1>
            <div className="flex items-start justify-between">
                <div className="ml-24 py-40">
                    <h1 className="text-4xl font-serif font-medium underline">Heading</h1>
                    <p className="text-xl font-serif ">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu dui non diam eleifend egestas id a ligula.</p>
                    <Link href={"/membership"} className="flex w-full py-10">
                    <Button variant="filled" color="rgba(0, 133, 57, 1)" size="md" radius="xl">Join Now</Button>
                    </Link>
                </div>
                <div className="flex items-center justify-end">
                    <Image src="/landing.png" alt="Running People Image" width={990} height={680} />
                </div> 
            </div>
         </div>
            
        </main>
    )
  }
  
