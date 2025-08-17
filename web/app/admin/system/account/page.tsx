'use client';

import { useState } from "react";

export default function Page() {
    const [name, setName] = useState("");

    return (
        <div>
            <h1>Account</h1>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border" />
        </div>
    );
}