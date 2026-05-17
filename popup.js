document.getElementById("apply").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url.includes("roblox.com")) {
    alert("Open Roblox first stupid!");
    return;
  }

  chrome.tabs.sendMessage(tab.id, {
    type: "APPLY_STYLES"
  });
});
