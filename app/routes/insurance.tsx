import { Button } from '~/components/Button'
import insuranceStyles from '~/styles/routes/insurance.css'

export function links() {
  return [
    {
      rel: 'stylesheet',
      href: insuranceStyles,
    },
  ]
}

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
          <h3 className="text-4xl font-bold">
            Sólo necesitas <span className="text-purple-600">6 pasos</span> para
            reportar el siniestro:
          </h3>

          <div className="mt-12 flex justify-between">
            <li className="left-2 w-full list-none space-y-5 text-steelBlue-800 sm:max-w-[55%] lg:max-w-[45%]">
              <ul className="flex items-center gap-x-4 text-2xl">
                <span className="inline-block w-10 text-center text-4xl font-bold text-purple-600">
                  1
                </span>
                <p>
                  Ingresa a{' '}
                  <span className="font-semibold">sbseguros.syc.com.co</span>{' '}
                  dando clic en el botón reportar
                </p>
              </ul>

              <ul className="flex items-center gap-x-4 text-2xl">
                <span className="inline-block w-10 text-center text-4xl font-bold text-purple-600">
                  2
                </span>
                <p>
                  Selecciona la opción{' '}
                  <span className="font-semibold">ACCIDENTES PERSONALES</span>
                </p>
              </ul>

              <ul className="flex items-center gap-x-4 text-2xl">
                <span className="inline-block w-10 text-center text-4xl font-bold text-purple-600">
                  3
                </span>
                <p>Aceptar la política de tratamiento de datos</p>
              </ul>

              <ul className="flex items-center gap-x-4 text-2xl">
                <span className="inline-block w-10 text-center text-4xl font-bold text-purple-600">
                  4
                </span>
                <p>Llenar los datos solicitados</p>
              </ul>

              <ul className="flex items-center gap-x-4 text-2xl">
                <span className="inline-block w-10 text-center text-4xl font-bold text-purple-600">
                  5
                </span>
                <p>Te llegará a tu correo un número de solicitud</p>
              </ul>

              <ul className="flex items-center gap-x-4 text-2xl">
                <span className="inline-block w-10 text-center text-4xl font-bold text-purple-600">
                  6
                </span>
                <p>
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
                className="max-w-[486px] object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <h3 className="third-section">
        Este seguro te da el amparo de dos accidentes:
      </h3>
      <section className="accidents">
        <div className="left-3">
          <img
            className="first"
            src="/images/routes/insurance/Shield.png"
            alt=""
          />

          <h4 className="text-purple-600">Renta diaria por hospitalización</h4>
          <p>
            SBS Seguros pagará al asegurado como consecuencia de un accidente
            según el amparo contratado "la renta diaria" expresada en la
            carátula de la póliza.
          </p>
          <img
            src="/images/routes/insurance/ManPurpleBackground.png"
            alt="hero"
          />
          <img
            className="mobile"
            src="/images/routes/insurance/MobilePurpleBackground.png"
            alt="Shield"
          />
        </div>
        <div className="right-3">
          <h4 className="text-purple-600">Muerte accidental</h4>
          <p>
            SBS Seguros pagará a los beneficiarios el valor asegurado señalado
            en la carátula de la póliza, si dentro de los ciento ochenta (180)
            días calendario contados desde la fecha del accidente
          </p>
          <img src="/images/routes/insurance/Briefcase.png" alt="Briefcase" />
          <h3>Tu bienestar para nosotros es importante</h3>
          <p>
            No olvides reportar de <br />
            inmediato
          </p>
        </div>
      </section>
      <section className="footer">
        <div className="footerbar">
          <img
            className="logo"
            src="/images/routes/insurance/Logo.png"
            alt="HoyTrabajas Logo"
          />
          <p>Síguenos</p>
          {/* <img src="images/Group 19.png" alt="Instagram" /> */}
        </div>
      </section>
    </>
  )
}

export default InsuranceRoute
