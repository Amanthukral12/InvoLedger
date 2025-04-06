export const parseUserAgent = (userAgent: string) => {
  let os = "unknown";
  if (userAgent.includes("Windows NT")) {
    const windowsVersion = userAgent.match(/Windows NT (\d+\.\d+)/);
    if (windowsVersion) {
      switch (windowsVersion[1]) {
        case "10.0":
          os = "Windows 10";
          break;
        case "6.3":
          os = "Windows 8.1";
          break;
        case "6.2":
          os = "Windows 8";
          break;
        case "6.1":
          os = "Windows 7";
          break;
        default:
          os = `Windows ${windowsVersion[1]}`;
      }
    }
  } else if (userAgent.includes("Mac OS X")) {
    os = "macOS";
  } else if (userAgent.includes("Linux")) {
    os = "Linux";
  }

  let browser = "Unknown";
  let version = "";

  if (userAgent.includes("Edg/")) {
    browser = "Microsoft Edge";
    version = userAgent.match(/Edg\/(\d+)/)?.[1] || "";
  } else if (userAgent.includes("Chrome/")) {
    browser = "Chrome";
    version = userAgent.match(/Chrome\/(\d+)/)?.[1] || "";
  } else if (userAgent.includes("Firefox/")) {
    browser = "Firefox";
    version = userAgent.match(/Firefox\/(\d+)/)?.[1] || "";
  } else if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
    browser = "Safari";
    version = userAgent.match(/Version\/(\d+)/)?.[1] || "";
  }

  let deviceType = "Desktop";
  if (userAgent.includes("Mobile")) {
    deviceType = "Mobile";
  } else if (userAgent.includes("Tablet")) {
    deviceType = "Tablet";
  }

  return {
    os,
    browser: `${browser} ${version}`,
    deviceType,
    fullUserAgent: userAgent,
  };
};
