import Link from 'next/link'

export default function NotFound() {
    return (
        // TODO
        <div>
            <h2>Not Found</h2>
            <p>Could not find requested resource</p>
            <Link href="/taskpane">Return Home</Link>
        </div>
    )
}