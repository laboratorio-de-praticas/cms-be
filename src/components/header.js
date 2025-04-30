import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import '../styles/header.css';

export default function Header() {
   const [menuAbertoHeader, setMenuAbertoHeader] = useState(false)

  const toggleMenuHeader = () => {
    setMenuAbertoHeader(!menuAbertoHeader)
  }
  return (
    <header>
      <div className="logo-fatec">
        <Image
          src="/imgs/logo fatec.png"
          alt="Logo Fatec"
          width={327.2}
          height={78.4}
          className="logo-fatec-foto"
        />
      </div>

      <div className={`redes-sociais-icons ${menuAbertoHeader ? "ativo" : ""}`}>
        <Link href="https://www.flickr.com/photos/governosp/">
          <Image src="/imgs/flickr.png" alt="Flickr" width={30} height={30} />
        </Link>
        <Link href="https://www.linkedin.com/company/governosp/">
          <Image
            src="/imgs/linkedin.png"
            alt="Linkedin"
            width={30}
            height={30}
          />
        </Link>
        <Link href="https://www.tiktok.com/@governosp">
          <Image src="/imgs/tiktok.png" alt="Tiktok" width={30} height={30} />
        </Link>
        <Link href="https://www.youtube.com/governosp/">
          <Image src="/imgs/youtube.png" alt="Youtube" width={30} height={30} />
        </Link>
        <Link href="https://x.com/governosp/">
          <Image src="/imgs/twitter.png" alt="Twitter" width={30} height={30} />
        </Link>
        <Link href="https://www.instagram.com/governosp/">
          <Image
            src="/imgs/istagram.png"
            alt="Instagram"
            width={30}
            height={30}
          />
        </Link>
        <Link href="https://www.facebook.com/governosp/">
          <Image
            src="/imgs/facebook.png"
            alt="Facebook"
            width={30}
            height={30}
          />
        </Link>
        <Link href="https://www.governo.sp.gov.br/" className="governo">
          <p>/governosp</p>
        </Link>
      </div>

      <div className="menu-hamburguer" onClick={toggleMenuHeader}>
        <Image src="/imgs/hamburguer.png" alt="Menu" width={20} height={13} />
      </div>
    </header>
  );
}
// autora: Isabele Letícia