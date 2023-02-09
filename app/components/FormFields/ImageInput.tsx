import { useRef, useState } from 'react'
import { Label, labelStyles } from './Label'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import { RiCloseFill } from 'react-icons/ri'
import { MdOutlineUploadFile } from 'react-icons/md'

interface ImageInputProps {
  name: string
  label: string
  currentImageUrl?: string
  alt?: HTMLImageElement['alt']
  isCentered?: boolean
  className?: string
}

export const ImageInput = ({
  name,
  label,
  currentImageUrl,
  alt,
  isCentered,
  className,
}: ImageInputProps) => {
  /** This inputRef will be used to clear the input file in case we want to delete a selected image */
  const inputRef = useRef<HTMLInputElement>(null)

  /** This currentUrl state will be used to show or hide the current existing image (uploaded in AWS) */
  const [currentUrl, setCurrentUrl] = useState<string | null | undefined>(
    currentImageUrl
  )

  /** This selectedImage state will be used to show or hide the current selected image (via the Input file) */
  const [selectedImage, setSelectedImage] = useState<File | null | undefined>()

  return (
    <>
      {selectedImage || currentUrl ? (
        <>
          <p className={labelStyles}>{label}</p>

          <ImageInputPlaceholder
            hasImage
            isCentered={isCentered}
            className={className}
          >
            <img
              src={
                (selectedImage
                  ? URL.createObjectURL(selectedImage)
                  : currentUrl) as string
              }
              alt={alt}
              className="aspect-square object-contain"
            />
            <button
              type="button"
              className="absolute bottom-[-12px] right-[-12px] flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600 shadow-lg"
              onClick={() => {
                setSelectedImage(null)
                setCurrentUrl(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
            >
              <RiCloseFill className="text-2xl" />
            </button>
          </ImageInputPlaceholder>
        </>
      ) : (
        <Label htmlFor={name} description={label} className="relative block">
          <input type="hidden" name={`delete_${name}`} value="true" />
          <ImageInputPlaceholder isCentered={isCentered} className={className}>
            <MdOutlineUploadFile className="text-5xl text-steelBlue-300" />
          </ImageInputPlaceholder>
        </Label>
      )}

      <input
        id={name}
        name={name}
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={(event) => setSelectedImage(event?.target?.files?.[0])}
        className={clsx(
          'pointer-events-none invisible my-3 mx-auto block h-0 text-center'
        )}
      />
    </>
  )
}

const ImageInputPlaceholder = ({
  children,
  hasImage,
  isCentered,
  className,
}: {
  children: React.ReactNode
  hasImage?: boolean
  isCentered?: boolean
  className?: string
}) => (
  <div
    className={twMerge(
      clsx(
        'relative flex aspect-square max-h-60 cursor-pointer items-center justify-center rounded-md bg-gray-100 shadow-md',
        hasImage &&
          'cursor-default border border-dashed border-gray-300 bg-transparent',
        isCentered && 'mx-auto',
        className
      )
    )}
  >
    {children}
  </div>
)
