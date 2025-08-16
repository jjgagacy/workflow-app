'use client';

import { useAuth } from "@/hooks/use-auth";
import Counter from "../ui/counter";

export default function Page() {
    
    return (
        <div>
            <h1>Admin</h1>
            <Counter />
        </div>
    );
}