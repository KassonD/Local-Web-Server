const { XMLParser } = require("fast-xml-parser");

const types = {
    VANILLA: { label: "VANILLA", versions: []},
    FORGE: { label: "FORGE", versions: []},
    NEOFORGE: { label: "NEOFORGE", versions: []},
    FABRIC: { label: "FABRIC", versions: []},
    PAPER: { label: "PAPER", versions: []}
}

async function getVanillaVersions(params) {
    try {
        const res = await fetch("https://launchermeta.mojang.com/mc/game/version_manifest_v2.json");
        const data = await res.json();
        
        const versions = data.versions
            .filter(version => version.type === "release")
            .map(version => version.id);

        return versions;
    }
    catch (err) {
        console.error("Error getting VANILLA versions:", err);
        return null;
    }
}

async function getForgeVersions(params) {
    try {
        const res = await fetch("https://maven.minecraftforge.net/net/minecraftforge/forge/maven-metadata.xml");
        const data = await res.text();

        const parser = new XMLParser();
        const xml = parser.parse(data);
        const versions = xml.metadata.versioning.versions.version
            .filter(version => !version.includes("-prerelease"));

        console.log(versions);
        return versions;
    }
    catch (err) {
        console.error("Error getting NEOFORGE versions:", err);
        return null;
    }
}

async function getNeoforgeVersions(params) {
    try {
        const res = await fetch("https://maven.neoforged.net/releases/net/neoforged/neoforge/maven-metadata.xml");
        const data = await res.text();

        const parser = new XMLParser();
        const xml = parser.parse(data);
        const versions = xml.metadata.versioning.versions.version
            .filter(version => !version.includes("-beta") && !version.includes("-alpha"));

        return versions;
    }
    catch (err) {
        console.error("Error getting NEOFORGE versions:", err);
        return null;
    }
}

async function refreshVersions(params) {
    const vanillaVersions = await getVanillaVersions()
    if (vanillaVersions)
        types.VANILLA.versions = vanillaVersions;

    const forgeVersions = await getForgeVersions()
    if (forgeVersions)
        types.FORGE.versions = forgeVersions;

    const neoforgeVersions = await getNeoforgeVersions()
    if (neoforgeVersions)
        types.NEOFORGE.versions = neoforgeVersions;
}

module.exports = {
    refreshVersions,
    types
}