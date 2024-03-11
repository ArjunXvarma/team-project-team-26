
import Image from "next/image";
import Link from "next/link";
import { Button, UnstyledButton } from "@mantine/core";
export default function Landing(){
    return (
        <main> 
          <div className="w-full h-full">
            <header className=" flex items-center justify-between px-16 pt-10">

                <p className="ml-4 text-2xl font-bold text-green-700">MyApp</p>
                <div className="flex items-center">
                    <Link href={"/login"} className="flex w-full justify-center">
                        <UnstyledButton className="font-semibold text-lg hover:text-green-700">Login</UnstyledButton>
                    </Link>
                    <p className="text-lg">/</p>
                    <Link href={"/signup"} className="flex w-full justify-center">
                        <UnstyledButton className="font-semibold  hover:text-green-700 text-lg ">SignUp</UnstyledButton>
                    </Link>
                </div>

            </header>
            
            <p className="text-center text-lg font-serif">“ Every journey begins with a single step ”</p>
            <div className="flex items-start justify-between">
                <div className="ml-24 py-40">
                    <p className="text-4xl font-serif font-medium underline">Heading</p>
                    <p className="text-xl font-serif ">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eu dui non diam eleifend egestas id a ligula.</p>
                    <Link href={"/membership"} className="flex w-full py-10">
                    <Button variant="filled" className="bg-green-700 hover:bg-green-800"  size="md" radius="xl">Join Now</Button>
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
  
