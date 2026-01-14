// CafeSanJuanVue/utils/cloudinary.js

const CLOUDINARY_CONFIG = {
  cloudName: 'dt7fbonmg',
  uploadPreset: 'Mesas_Restaurante'
}

/**
 * Sube una imagen a Cloudinary
 * @param {File} file - Archivo de imagen
 * @param {string} folder - Carpeta en Cloudinary (opcional)
 * @returns {Promise<object>} Datos de la imagen subida
 */
export async function subirImagenMesa(file, folder = 'mesas') {
  try {
    // Validar archivo
    if (!file) {
      throw new Error('No se ha seleccionado ningún archivo')
    }

    // Validar tipo de archivo
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!tiposPermitidos.includes(file.type)) {
      throw new Error('Formato de archivo no válido. Use JPG, PNG o WEBP')
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. Máximo 10MB')
    }

    console.log('📤 Subiendo imagen a Cloudinary...')
    console.log('🔧 Cloud Name:', CLOUDINARY_CONFIG.cloudName)
    console.log('🔧 Upload Preset:', CLOUDINARY_CONFIG.uploadPreset)
    console.log('📁 Carpeta:', folder)

    // Crear FormData
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset)
    formData.append('folder', folder)

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`
    console.log('🌐 URL de subida:', uploadUrl)

    // Subir a Cloudinary
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData
    })

    console.log('📥 Respuesta status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ Error data:', errorData)
      throw new Error(errorData.error?.message || `Error ${response.status}: ${errorData.message || 'Error al subir la imagen'}`)
    }

    const data = await response.json()
    
    console.log('✅ Imagen subida exitosamente:', data.secure_url)
    
    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes
    }
    
  } catch (error) {
    console.error('❌ Error al subir imagen:', error)
    throw error
  }
}

/**
 * Genera URL optimizada de Cloudinary
 * @param {string} url - URL original de la imagen
 * @param {object} options - Opciones de transformación
 */
export function generarUrlOptimizada(url, options = {}) {
  if (!url || !url.includes('cloudinary')) return url
  
  const {
    width = 400,
    height = 300,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options

  // Insertar transformaciones en la URL de Cloudinary
  return url.replace('/upload/', `/upload/w_${width},h_${height},c_${crop},q_${quality},f_${format}/`)
}

export default {
  subirImagenMesa,
  generarUrlOptimizada
}
