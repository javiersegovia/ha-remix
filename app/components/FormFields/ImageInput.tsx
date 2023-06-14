import { useRef, useState } from 'react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import { RiCloseFill } from 'react-icons/ri'
import { MdOutlineUploadFile } from 'react-icons/md'
import { useField } from 'remix-validated-form'

import { Label, labelStyles } from './Label'
import { ErrorMessage } from './ErrorMessage'

interface ImageInputProps {
  name: string
  label?: string
  currentImageKey: string | undefined | null
  currentImageUrl: string | undefined | null
  alt?: HTMLImageElement['alt']
  isCentered?: boolean
  className?: string
}

export const ImageInput = ({
  name,
  label,
  currentImageUrl,
  currentImageKey,
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

  const { error: fieldError } = useField(name)
  const { error: deleteError } = useField(`${name}Key`)
  const error = fieldError || deleteError

  return (
    <>
      <div className="flex h-full w-full flex-col">
        {selectedImage || currentUrl ? (
          <>
            {label && <p className={labelStyles}>{label}</p>}
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

            <input
              type="hidden"
              name={`${name}Key`}
              value={currentImageKey || undefined}
            />
          </>
        ) : (
          <Label
            htmlFor={name}
            description={label}
            className="relative mx-auto inline-block"
          >
            <ImageInputPlaceholder
              isCentered={isCentered}
              className={className}
              hasError={Boolean(error)}
            >
              <MdOutlineUploadFile className="text-5xl text-steelBlue-300" />
            </ImageInputPlaceholder>

            <ErrorMessage>{error}</ErrorMessage>
          </Label>
        )}
      </div>

      <input
        id={name}
        name={name}
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={(event) =>
          setSelectedImage(event?.target?.files?.[0] || null)
        }
        className={clsx(
          'pointer-events-none invisible mx-auto  block h-0 text-center'
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
  hasError,
}: {
  children: React.ReactNode
  hasImage?: boolean
  isCentered?: boolean
  className?: string
  hasError?: boolean
}) => (
  <div
    className={twMerge(
      clsx(
        'relative flex aspect-square max-h-60 min-h-[240px] cursor-pointer items-center justify-center rounded-md bg-gray-100 shadow-md',
        hasImage &&
          'cursor-default border border-dashed border-gray-300 bg-transparent',
        isCentered && 'mx-auto',
        hasError && 'border border-dashed border-red-500',
        className
      )
    )}
  >
    {children}
  </div>
)
