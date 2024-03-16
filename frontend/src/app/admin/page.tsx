"use client"
import React, { useState } from 'react';
import Link from "next/link";
import { CiUser} from "react-icons/ci";
import { Button } from "@mantine/core";
import { Modal } from '@mantine/core';
import { Input} from '@mantine/core';
import { FiPlus } from "react-icons/fi";
import { useDisclosure } from '@mantine/hooks';
import { TextInput } from '@mantine/core';
import { IoIosSearch } from "react-icons/io";
import { Select } from '@mantine/core';

export default function Admin() {

    const [memberData, setMemberData] = useState<{name:String, date:String, email:String, type:String, action:String}[]>([]);
    const [name, setName] = useState('');
    const [opened, { open, close }] = useDisclosure(false);
    const filters = ['Membership Type', 'Payment Method'];
    const types = ['Basic', 'Standard', 'Premium'];
    const methods= ['Apple Pay', 'Google Pay', 'PayPal', 'AliPay', 'Credit Card'];
    const elements = [
        { name: 'RP404'   , date: '5th June, 2020', email: 'rheaprakash2004@gmail.com', type: 'Basic', payment:'Apple Pay' },
        { name: 'Nitrogen' , date: '5th June, 2020', email: 'rheap@', type: 'Basic', payment:'Apple Pay' },
        { name: 'Yttrium'  , date: '5th June, 2020', email: 'rheap@', type: 'Basic', payment:'Apple Pay' },
        { name: 'Barium'   , date: '5th June, 2020', email: 'rheap@', type: 'Basic', payment:'Apple Pay' },
        { name: 'Cerium'   , date: '5th June, 2020', email: 'rheap@', type: 'Basic', payment:'Apple Pay'}
    ]

    const [filter, setFilter] = useState<string | null>(null);
    const [type, setType] = useState<string | null>('');
    const [method, setMethod] = useState<string | null>('');

    function remove(name:string, email:string) {
        console.log(name);
        console.log(email);
    }

    return (  
        <main className="w-screen h-screen">
            <div className="w-full h-full">
                <div className="h-full m-8 drop-shadow-xl rounded-md bg-gray-100 py-4 px-4">
                    <div className='flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-10'>
                        <Select
                            placeholder="Filter"
                            data={filters}
                            value={filter} 
                            size='md'
                            defaultValue={null}
                            onChange={setFilter}
                            clearable
                            className="w-full md:w-auto"
                        />
                        { filter!= null &&
                            ( filter===filters[0] ? 
                                (
                                    <Select
                                        placeholder="Filter Types"
                                        data={types}
                                        value={type} 
                                        size='md'
                                        onChange={setType}
                                        clearable
                                        className="w-full md:w-auto"
                                    />
                                ):
                                (
                                    <Select
                                        placeholder="Filter Methods"
                                        data={methods}
                                        value={method} 
                                        size='md'
                                        onChange={setMethod}
                                        clearable
                                        className="w-full md:w-auto"
                                    />
                                )
                            )
                        }
                        <TextInput
                            value={name}
                            placeholder='Search by Name'
                            size='md'
                            className='w-full md:w-96'
                            leftSection={<IoIosSearch size={20}/>}
                            onChange={(event) => setName(event.currentTarget.value)}
                        />
                        <div className='flex-grow' />
                        <div className='justify-self-end'>
                            <Modal opened={opened} onClose={close} withCloseButton={false} centered>
                                <p className="text-lg mb-4">Enter User Information:</p>
                                <Input size="md" placeholder="Email"></Input>
                                <div className="flex justify-center mt-4">
                                    <Button className="bg-primary">Send Request</Button>  
                                </div>
                            </Modal>
                            <Button className="bg-primary rounded-full items-center" onClick={open}>Add User <FiPlus className="ml-2" size={20}/></Button>
                        </div>
                    </div>

                    <table className="min-w-full flex-shrink bg-white rounded-md">
                        <thead className="text-sm font-semibold shad-text-gray-500 dark:shad-text-gray-400">
                        <tr className="border-b text-green-900">
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Date</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Membership Type</th>
                            <th className="px-4 py-3 text-left">Payment Method</th>
                            <th className="px-12 py-3 text-left">Action</th>
                        </tr>
                        </thead>
                        <tbody className="shad-text-gray-500 dark:shad-text-gray-400 text-sm">
                            {elements && elements.map((element) => (
                                    <tr  className="border-b hover:shad-bg-gray-100 dark:hover:shad-bg-gray-800" key={element.name}>
                                        <td className="px-4 py-3 ">{element.name}</td>
                                        <td className="px-4 py-3 ">{element.date}</td>
                                        <td className="px-4 py-3 ">{element.email}</td>
                                        <td className="px-4 py-3 ">{element.type}</td>
                                        <td className="px-4 py-3 ">{element.payment}</td>
                                        <td className="px-4 py-3"><Button variant="default" onClick={() => remove(element.name, element.email)}>Remove User</Button></td>
                                    </tr>
                                ))}
                        </tbody>
                    </table> 
                </div>
            </div>
        </main>
    );
}
