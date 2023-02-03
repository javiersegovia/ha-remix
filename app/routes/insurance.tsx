import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
} from 'react-icons/fa'
import { Button } from '~/components/Button'

const InsuranceRoute = () => {
  return (
    <>
      <nav className="sticky bg-steelBlue-800 py-2" role="navigation">
        <div className="logo container mx-auto flex h-full w-full items-center px-4">
          <img
            src="/images/routes/insurance/Logo.png"
            alt="HoyTrabajas"
            width="200px"
            height="43px"
          />
        </div>
      </nav>

      <header className="w-full bg-purple-600">
        <div className="hero-section container mx-auto flex w-full items-center justify-between px-4 py-7 xl:py-36 xl:px-28">
          <div className="space-y-4 lg:space-y-5 2xl:space-y-10">
            <h2 className="text-[32px] font-bold text-white xl:text-5xl">
              Beneficios
            </h2>

            <h3 className="max-w-xl text-[32px] font-bold text-electricYellow-500 xl:text-5xl">
              Seguros de accidentes personales para ti
            </h3>

            <p className="max-w-xl text-lg font-medium text-white lg:font-semibold xl:text-[32px] xl:leading-10">
              Nosotros te cuidamos es por eso que te explicamos como funciona tu
              seguro
            </p>
          </div>

          <div>
            <img
              src="/images/routes/insurance/TwoPeopleYellowBackground.png"
              alt="Two People"
              className="hidden h-[238px] w-[238px] object-contain md:block xl:h-96 xl:w-96"
            />
          </div>
        </div>
      </header>

      <section className="steps bg-steelBlue-100/50 py-14">
        <div className="container mx-auto px-4 xl:px-28">
          <h3 className="text-2xl font-bold text-steelBlue-800 lg:text-4xl">
            Sólo necesitas <span className="text-purple-600">6 pasos</span> para
            reportar el siniestro:
          </h3>

          <div className="mt-12 flex justify-between">
            <li className="left-2 w-full list-none space-y-5 text-steelBlue-800 md:max-w-[55%] lg:max-w-[45%]">
              <ul className="flex items-center gap-x-4 text-base lg:text-2xl">
                <span className="inline-block w-10 text-center text-4xl font-bold text-purple-600">
                  1
                </span>
                <p className="text-steelBlue-800">
                  Ingresa a{' '}
                  <span className="font-semibold">sbseguros.syc.com.co</span>{' '}
                  dando clic en el botón reportar
                </p>
              </ul>

              <ul className="flex items-center gap-x-4 text-base lg:text-2xl">
                <span className="inline-block w-10 text-center text-4xl font-bold text-purple-600">
                  2
                </span>
                <p className="text-steelBlue-800">
                  Selecciona la opción{' '}
                  <span className="font-semibold">ACCIDENTES PERSONALES</span>
                </p>
              </ul>

              <ul className="flex items-center gap-x-4 text-base lg:text-2xl">
                <span className="inline-block w-10 text-center text-4xl font-bold text-purple-600">
                  3
                </span>
                <p className="text-steelBlue-800">
                  Aceptar la política de tratamiento de datos
                </p>
              </ul>

              <ul className="flex items-center gap-x-4 text-base lg:text-2xl">
                <span className="inline-block w-10 text-center text-4xl font-bold text-purple-600">
                  4
                </span>
                <p className="text-steelBlue-800">
                  Llenar los datos solicitados
                </p>
              </ul>

              <ul className="flex items-center gap-x-4 text-base lg:text-2xl">
                <span className="inline-block w-10 text-center text-4xl font-bold text-purple-600">
                  5
                </span>
                <p className="text-steelBlue-800">
                  Te llegará a tu correo un número de solicitud
                </p>
              </ul>

              <ul className="flex items-center gap-x-4 text-base lg:text-2xl">
                <span className="inline-block w-10 text-center text-4xl font-bold text-purple-600">
                  6
                </span>
                <p className="text-steelBlue-800">
                  La compañía de seguros se contactará para realizar el pago de
                  la indemnización
                </p>
              </ul>

              <div className="max-w-xl pt-14">
                <Button href="https://sbseguros.syc.com.co" external>
                  Reportar
                </Button>
              </div>
            </li>

            <div className="right-2 hidden md:block">
              <img
                src="/images/routes/insurance/Steps.png"
                alt="Steps"
                className="object-contain sm:max-w-[323px] lg:max-w-[486px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative">
        <section className="container mx-auto mt-12 px-4 lg:mt-28 xl:px-28">
          <h3 className="mb-12 text-2xl font-bold text-steelBlue-800 lg:text-4xl 2xl:text-5xl">
            Este seguro te da el amparo de dos accidentes:
          </h3>
          <div className="grid items-center sm:grid-cols-2">
            <img
              src="/images/routes/insurance/Shield.png"
              alt="Shield"
              className="hidden justify-self-center sm:block"
            />
            <div>
              <h4 className="mb-6 text-lg font-bold text-purple-600 sm:text-xl lg:text-[28px] 2xl:text-[32px]">
                Muerte accidental
              </h4>
              <p className="max-w-2xl text-justify text-base font-medium text-steelBlue-800 lg:text-lg 2xl:text-xl">
                SBS Seguros pagará a los beneficiarios el valor asegurado
                señalado en la carátula de la póliza, si dentro de los ciento
                ochenta (180) días calendario contados desde la fecha del
                accidente
              </p>
            </div>
          </div>
          <div className="mt-12 grid items-center sm:grid-cols-2">
            <div>
              <h4 className="mb-6 text-lg font-bold text-purple-600 sm:text-xl lg:text-[28px] 2xl:text-[32px]">
                Renta diaria por hospitalización
              </h4>
              <p className="max-w-2xl text-justify text-base font-medium text-steelBlue-800 lg:text-lg 2xl:text-xl">
                SBS Seguros pagará al asegurado como consecuencia de un
                accidente según el amparo contratado "la renta diaria" expresada
                en la carátula de la póliza.
              </p>
            </div>
            <img
              src="/images/routes/insurance/Briefcase.png"
              alt="Briefcase"
              className="hidden justify-self-center sm:block"
            />
          </div>

          <div className="mt-20 mb-11 grid items-center pb-11 sm:grid-cols-2">
            <div>
              <img
                src="/images/routes/insurance/ManPurpleBackground.png"
                alt="hero"
                className="hidden sm:block sm:max-w-[265px] lg:max-w-none"
              />
              <img
                className="absolute bottom-0 left-0 block sm:hidden"
                src="/images/routes/insurance/MobilePurpleBackground.png"
                alt="Shield"
              />
            </div>
            <div>
              <h3 className="max-w-md text-[32px] font-bold leading-10 text-steelBlue-800">
                Tu bienestar para nosotros es importante
              </h3>
              <p className="mt-6 text-xl font-medium text-steelBlue-700 lg:max-w-xs">
                No olvides reportar de inmediato
              </p>
            </div>
          </div>
        </section>
      </section>

      <section className="footer bg-steelBlue-800">
        <div className="footerbar items-center px-5 py-10 px-4 md:flex  lg:ml-16 ">
          <img
            className="logo"
            src="/images/routes/insurance/Logo.png"
            alt="HoyTrabajas Logo"
          />
          <div className="items-center md:ml-40 md:flex lg:ml-[249px]  lg:block 2xl:ml-[348px]">
            <p className="px-2 pt-2 text-electricYellow-500 md:mr-10 lg:px-0">
              Síguenos
            </p>

            <div className="mt-4 ml-[7px] flex items-center gap-2 text-2xl text-white md:ml-0">
              <a
                href="https://www.instagram.com/hoytrabajas/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram />
              </a>
              <a
                href="https://es.linkedin.com/company/hoytrabajas"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedinIn />
              </a>
              <a
                href="https://www.facebook.com/HoyTrabajasLatam"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://www.tiktok.com/@hoytrabajas"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTiktok />
              </a>
              <a
                href="https://api.whatsapp.com/send/?phone=573118208820&text&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaWhatsapp />
              </a>
              <a
                href="https://www.youtube.com/channel/UCRpq_yKpzlfIJCb3hykUA9g"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default InsuranceRoute
