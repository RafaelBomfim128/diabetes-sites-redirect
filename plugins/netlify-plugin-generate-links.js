module.exports = {
    onPreBuild: async ({ utils }) => {
      try {
        console.log("Executando script generate-index.js...");
  
        const { execSync } = require("child_process");
        execSync("node generate-index.js", { stdio: "inherit" });
  
        console.log("Script executado com sucesso!");
      } catch (error) {
        console.error("Erro ao executar generate-index.js:", error);
        utils.build.failBuild("Falha ao executar o script generate-index.js.");
      }
    },
  };