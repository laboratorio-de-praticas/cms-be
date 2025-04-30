import Image from 'next/image'
import '../styles/footer.css' 

const Footer=()=>{
    return (
      <footer>
        <div className="footer-fundo d-flex justify-content-center">
          <Image
            src="/imgs/logo_cps_gov.png"
            alt="Logo CPS Gov"
            width={279.4}
            height={127}
            className="logo-fatec-footer"
          />
        </div>
      </footer>
    );
}
export default Footer