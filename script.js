const regions = {
	"au": {
		address1: "Ground Floor, 153 Flinders Street,",
		address2: "Adelaide, SA 5000",
		banner: "https://cdn.craft.cloud/97df3833-063d-4b7a-b1fe-2cc2f1603c1c/assets/images/Email-Signatures/100k_giveaway_2026_banner.png",
		banner_link: "https://splose.com/100k-kickstart-giveaway?utm_source=email&utm_medium=staff_signature&utm_campaign=kick-start-promo&utm_content=signature_banner_au"
	},
	"uk": {
		address1: "WeWork, 71-91 Aldwych House",
		address2: "London WC2B 4HN",
		banner: "https://cdn.craft.cloud/97df3833-063d-4b7a-b1fe-2cc2f1603c1c/assets/images/Email-Signatures/100k_giveaway_2026_banner.png",
		banner_link: "https://splose.com/100k-kickstart-giveaway?utm_source=email&utm_medium=staff_signature&utm_campaign=kick-start-promo&utm_content=signature_banner_uk"
	}
}

// Generate a phone link for a given mobile number and region
const generatePhoneLink = (mobile, region) => {
	let formattedMobile = mobile;
	// if mobile starts with 04 or 07, remove the 0
	if (mobile.startsWith("04") || mobile.startsWith("07")) {
		formattedMobile = formattedMobile.substring(1);
	} else {
		return "tel:" + mobile;
	}
	switch(region.toLowerCase()) {
		case "au":
			return "tel:+61" + formattedMobile;
		case "uk":
			return "tel:+44" + formattedMobile;
		default:
			return "tel:" + mobile;
	}
}

document.addEventListener("DOMContentLoaded", function() {
	const copyBtn = document.querySelector("button[data-copy-button]");
	const signatureTemplate = document.querySelector(".signature-template");
	var signatureOutput = document.querySelector(".signature-output");

	// Handle form submission
	var form = document.getElementById("signatureGenerator");
	if(form != null) {
		form.addEventListener("submit", function(e) {
			e.preventDefault();

			// Get all form field values
			var formData = new FormData(form);
			var fieldValues = {};
			for(var pair of formData.entries()) {
				fieldValues[pair[0]] = pair[1];
			}

			// Get base HTML From the signature template
			var signatureHTML = signatureTemplate.innerHTML;

			// Basic replacement of all placeholders with form values
			for(var fieldName in fieldValues) {
				var placeholder = "{{" + fieldName + "}}";

				// run any extra logic for specific fields
				switch(fieldName) {
					case "mobile":
						var telPlaceholder = "{{telLink}}";
						const telLink = generatePhoneLink(fieldValues[fieldName], fieldValues["site"]);
						signatureHTML = signatureHTML.replace(new RegExp(telPlaceholder, "g"), telLink);
						break;
					default:
						break;
				}

				var value = fieldValues[fieldName] || "";
				signatureHTML = signatureHTML.replace(new RegExp(placeholder, "g"), value);
			}

			// Update the signature output with replaced fields
			signatureOutput.innerHTML = signatureHTML;

			/** 
			 * Other dynamic signature tasks:
			*/

			// - Replace the address with the address for the region
			const addressEl = signatureOutput.querySelector("[data-address]");
			if(addressEl != null) {
				const region = fieldValues["site"];
				const regionData = regions[region.toLowerCase()];
				addressEl.innerHTML = regionData.address1 + "<br>" + regionData.address2;
			}
			// - Replace the banner with the banner for the region (if banner is set)
			if (fieldValues["include_banner"] == "1") {
				if (regions[fieldValues["site"].toLowerCase()].banner) {
					const bannerTemplate = document.querySelector("[data-signature-templates] > .banner-template");
					const bannerEl = signatureOutput.querySelector("[data-banner]");
					if(bannerEl != null) {
						let bannerLink = "https://splose.com?utm_source=email&utm_medium=staff_signature&utm_content=signature_banner";
						// update the banner URL with config
						if (regions[fieldValues["site"].toLowerCase()].banner_link) {
							bannerLink = regions[fieldValues["site"].toLowerCase()].banner_link;
						}
						const bannerSrc = regions[fieldValues["site"].toLowerCase()].banner;

						let bannerHtml = bannerTemplate.innerHTML;
						bannerHtml = bannerHtml.replace(new RegExp("{{bannerSrc}}", "g"), bannerSrc);
						bannerHtml = bannerHtml.replace(new RegExp("{{bannerLink}}", "g"), bannerLink);
						
						bannerEl.innerHTML = bannerHtml;
					}
				}
			}

			/** EOF dynamic signature tasks */

			// Show the signature wrapper & scroll to the bottom of the page
			signatureOutput.style.display = "block";

			setTimeout(() => {
				window.scrollTo({
					top: document.body.scrollHeight,
					behavior: "smooth"
				});
			}, 200);
			setTimeout(() => {
				copyBtn.style.opacity = "1";
			}, 700);
		});
	}

	// Copy button functionality
	if(copyBtn != null) {
		copyBtn.addEventListener("click", function() {
			var selection = document.getSelection();

			selection.removeAllRanges();
			selection.selectAllChildren(document.querySelector(".signature-output"));

			document.execCommand("Copy");

			selection.empty();
			alert("Signature copied to clipboard");
		});
	}
});