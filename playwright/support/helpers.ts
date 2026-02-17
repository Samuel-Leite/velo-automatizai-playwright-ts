export function generateOrderCode() {
    // Prefixo fixo
    const prefix = "VLO-";

    // Gera 3 letras maiúsculas aleatórias
    const letters = Array.from({ length: 3 }, () =>
        String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join("");

    // Gera 3 dígitos numéricos aleatórios
    const numbers = Array.from({ length: 3 }, () =>
        Math.floor(Math.random() * 10)
    ).join("");

    // Concatena tudo
    return prefix + letters + numbers;
}