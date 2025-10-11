import { useEffect, useState } from "react";
import packageJson from "../../package.json";

const semverGreaterThan = (versionA, versionB) => {
  const versionsA = versionA.split(/\./g);
  const versionsB = versionB.split(/\./g);

  while (versionsA.length || versionsB.length) {
    const a = Number(versionsA.shift());
    const b = Number(versionsB.shift());
    if (a === b) continue;
    return a > b || isNaN(b);
  }
  return false;
};

export const CacheBuster = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isLatestVersion, setIsLatestVersion] = useState(false);

  const refreshCacheAndReload = async () => {
    console.log("Clearing cache and reloading...");

    if (caches) {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
    }

    // Clear local/session storage if needed
    localStorage.clear();
    sessionStorage.clear();

    // Reload without cache
    window.location.reload();
  };

  useEffect(() => {
    fetch(`/meta.json?t=${new Date().getTime()}`, {
      cache: "no-cache",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    })
      .then((response) => response.json())
      .then((meta) => {
        const latestVersion = meta.version;
        const currentVersion = packageJson.version;

        const shouldForceRefresh = semverGreaterThan(
          latestVersion,
          currentVersion
        );

        if (shouldForceRefresh) {
          console.log(
            `New version available: ${latestVersion}. Current: ${currentVersion}`
          );
          setLoading(false);
          setIsLatestVersion(false);
        } else {
          console.log(`Latest version: ${latestVersion}`);
          setLoading(false);
          setIsLatestVersion(true);
        }
      })
      .catch((err) => {
        console.error("Could not fetch meta.json", err);
        setLoading(false);
        setIsLatestVersion(true);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!isLatestVersion) {
    refreshCacheAndReload();
    return <div>Updating application...</div>;
  }

  return children;
};
