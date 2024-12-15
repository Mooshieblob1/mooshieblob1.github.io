import type { JSX } from "preact/jsx-runtime";

export default function WebFooter(): JSX.Element {
    return (
        <footer class="footer-container">
            <div class="footer-text">
                <span>&copy; {new Date().getFullYear()} Mooshieblob</span>
                <a
                    id="ipv6"
                    href="https://iplocation.io/ipv6-compatibility-checker?url=referer"
                >
                    <img
                        src="https://iplocation.io/images/ipv6-non-validated.svg"
                        alt="ipv6 ready"
                        title="ipv6 ready"
                        style={{
                            border: 0,
                            padding: 0,
                            width: "36px",
                            height: "18px",
                            marginLeft: "10px",
                        }}
                    />
                </a>
            </div>
        </footer>
    );
}
