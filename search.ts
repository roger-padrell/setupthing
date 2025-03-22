import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import flathub from "./flathub.json" with {type: "json"};


interface RegistryResult {
  registry: string;
  exists: boolean;
  packageName: string;
}

async function checkApt(pkg: string): Promise<RegistryResult> {
  try {
    const res = await fetch(`https://packages.debian.org/search?keywords=${pkg}`);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    return {
      registry:"apt", 
      exists: (!!doc?.querySelector(`a[href*="/${pkg}"]`)), 
      packageName: pkg
    };
  } catch {
    return {
      registry:"apt", 
      exists: false, 
      packageName: pkg
    };
  }
}

async function checkDnf(pkg: string): Promise<RegistryResult> {
  try {
    const targetURL = `https://packages.fedoraproject.org/index/${pkg.slice(0,2)}.html`
    const res = await fetch(targetURL);
    const html = await res.text();
    return {
      registry:"dnf", 
      exists: (html.includes(pkg)), 
      packageName: pkg
    };
  } catch {
    return {
      registry:"dnf", 
      exists: false, 
      packageName: pkg
    };
  }
}

async function checkPacman(pkg: string): Promise<RegistryResult> {
  try {
    const res = await fetch(`https://archlinux.org/packages/?q=${pkg}`);
    const html = await res.text();
    return {
      registry:"pacman", 
      exists: html.includes(`1 exact match found`), 
      packageName: pkg
    };
  } catch {
    return {
      registry:"pacman", 
      exists: false, 
      packageName: pkg
    };
  }
}

async function checkSnap(pkg: string): Promise<RegistryResult> {
  try {
    const res = await fetch(`https://snapcraft.io/${pkg}`);
    const html = await res.text();
    const cont = JSON.parse(html.split(`<script type="application/ld+json">`)[3].split("</script>")[0])
    return {
      registry:"snap", 
      exists: (cont["name"] == pkg), 
      packageName: pkg
    };
  } catch {
    return {
      registry:"snap", 
      exists: false, 
      packageName: pkg
    };
  }
}

async function checkFlatpak(pkg: string): Promise<RegistryResult> {
  try {
    let exists = false;
    let name = pkg.toLowerCase();
    let key = Object.keys(flathub).find(
      k => k.toLowerCase() === name
    );
    key = key || "";
    if(Object.keys(flathub).includes(key)){
      exists=true;
      name = flathub[key] || "";
    }
    else{
      exists=false;
    }
    return {
      registry:"flatpack", 
      exists: exists, 
      packageName: name
    };
  } catch {
    return {
      registry:"flatpack", 
      exists: false, 
      packageName: pkg.toLowerCase()
    };
  }
}

async function checkBrew(pkg: string): Promise<RegistryResult> {
  try {
    const res = await fetch("https://formulae.brew.sh/api/formula.json");
    const data = await res.json();
    return {
      registry:"brew", 
      exists: data.some((formula: { name: string }) => formula.name === pkg), 
      packageName: pkg
    };
  } catch {
    return {
      registry:"brew", 
      exists: false, 
      packageName: pkg
    };
  }
}

async function checkNixEnv(pkg: string): Promise<RegistryResult> {
  try {
    const res = await fetch(`https://search.nixos.org/packages?sort=relevance&type=packages&query=${pkg}`);
    const html = await res.text();
    return {
      registry:"nix", 
      exists: html.split("Data from nixpkgs")[1].includes(pkg), 
      packageName: pkg
    };
  } catch {
    return {
      registry:"nix", 
      exists: false, 
      packageName: pkg
    };
  }
}

// Add similar functions for other registries...

async function checkPackage(pkg: string): Promise<RegistryResult[]> {
  const checks = [
    { name: "apt", fn: checkApt },
    { name: "dnf", fn: checkDnf },
    { name: "pacman", fn: checkPacman },
    { name: "snap", fn: checkSnap },
    { name: "flatpak", fn: checkFlatpak },
    { name: "brew", fn: checkBrew },
    { name: "nix-env", fn: checkNixEnv },
    // Add other registries here...
  ];

  const results = await Promise.all(
    checks.map(async (check) => (await check.fn(pkg)))
  );

  return results;
}

// Example usage:
const packageName = Deno.args[0];
if (!packageName) {
  console.error("Please provide a package name");
  Deno.exit(1);
}

const results = await checkPackage(packageName);
console.log(results);