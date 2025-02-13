import { Link } from '@remix-run/react'
import { Container } from '~/components/Layout/Container'
import { BiArrowBack } from 'react-icons/bi'
import { Title } from '~/components/Typography/Title'
import { Box } from '~/components/Layout/Box'

// Todo: should be dynamic
const video = {
  title: 'Diosito proveerá',
  author: 'HoyTrabajas',
  description: `Hoy te presentamos ¿Cómo viajar? Y organizarte financieramente.
    Cami y Leo nos cuentan a lo largo de este capítulo, cómo pudieron organizar su vida financiera para cumplir con sus viajes soñados.
    Recuerda que la buena planeación es la clave`,
}

export default function DashboardEducationRoute() {
  return (
    <div className="relative z-10 w-full flex-1 py-10">
      <img
        className="absolute left-0 top-0 -z-10 opacity-[15%]"
        src="/images/block_dashboard_overview_yellow.png"
        alt="Bloque Amarillo"
      />
      <img
        className="absolute bottom-0 right-0 -z-10 opacity-[15%]"
        src="/images/block_dashboard_overview_green.png"
        alt="Bloque Verde"
      />

      <Container className="text-steelBlue-800">
        <Link to="/dashboard/overview">
          <button className="flex items-center gap-3 text-steelBlue-400">
            <BiArrowBack className="text-2xl" />
            <span className="tracking-widest">Regresar</span>
          </button>
        </Link>

        <Title className="mt-6 text-xl lg:mt-10" as="h1">
          Educación Financiera
        </Title>

        <p className="mt-6 lg:mt-9">
          Bienvenido, aquí podrás encontrar una manera diferente de aprender.
        </p>

        <p className="mt-2 font-bold lg:text-xl">
          Planea, proyéctate y aprende con nosotros
        </p>

        <video className="mt-5 w-full rounded-lg" controls>
          <source
            src="https://ht-benefits-assets.s3.amazonaws.com/Beneficios_EducacionFinanciera_1.MOV"
            type="video/mp4"
          />
        </video>

        <section className="mt-10 px-4">
          <Title as="h4">{video.title}</Title>
          <p className="text-steelBlue-400">{video.author}</p>
          <p className="mt-3 hidden whitespace-pre-line lg:block">
            {video.description}
          </p>
        </section>

        <div className="my-7 h-[2px] w-full bg-gray-200 lg:my-10" />

        <aside>
          <Title as="h4" className="text-center lg:text-left">
            Encuentra el mejor contenido aquí
          </Title>

          <Box className="mt-6 flex items-center gap-4 p-8 !shadow-xl sm:gap-14">
            <img src="/images/bito/bito_2.png" alt="Robot BitO" />
            <div>
              <p className="font-bold text-steelBlue-400">¡Recuerda!</p>
              <p className="">
                Todos los jueves a las 6:00pm encontrarás nuevo contenido.
              </p>
            </div>
          </Box>
        </aside>
      </Container>
    </div>
  )
}
