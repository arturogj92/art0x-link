#!/bin/bash
# Este script recorre recursivamente el directorio actual y, para cada archivo de tipo texto,
# añade una cabecera con la ruta y nombre del archivo y su contenido en project_content.txt

OUTPUT_FILE="project_content.txt"
# Limpiamos el archivo de salida si ya existe
> "$OUTPUT_FILE"

# Encuentra todos los archivos (omitimos directorios)
find . -type f | while IFS= read -r file; do
    # Usamos el comando 'file' para determinar el MIME type y comprobamos que empiece por "text/"
    mime=$(file -b --mime-type "$file")
    if [[ $mime == text/* ]]; then
        echo "----- File: $file -----" >> "$OUTPUT_FILE"
        cat "$file" >> "$OUTPUT_FILE"
        echo -e "\n\n" >> "$OUTPUT_FILE"
    fi
done

echo "Contenido extraído en: $OUTPUT_FILE"
