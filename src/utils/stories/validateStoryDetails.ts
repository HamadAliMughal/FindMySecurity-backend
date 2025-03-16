export function validateStoryDetails(storyDetails: any): boolean {
    if (storyDetails && storyDetails["type_of_story"] === "life_story") {
        const requiredProperties = [
            "name_of_deceased",
            "birth_information",
            "death_information",
            "known_social_media",
            "general_notes_section",
            "funeral_details",
            "schools_attended",
            "military_service",
            "marriage",
            "family_members",
            "donate"
        ];
        
        if (storyDetails["general_info"]) {
            const generalInfoKeys = Object.keys(storyDetails["general_info"]);
            const missingProperties = requiredProperties.filter(prop => !generalInfoKeys.includes(prop));
            if (missingProperties.length === 0) {
                //  if (storyDetails["prompts"]) {
                //     const prompts = storyDetails["prompts"];
                //     if (Array.isArray(prompts) ) {
                        return true;
            //    }
            // }
             }
        }
    }
    if (storyDetails && storyDetails["type_of_story"] === "classmates_story") {
        const requiredProperties = [
            "class_information",
            "class_purpose",
            "class_involved"
        ];

        if (storyDetails["general_info"]) {
            const generalInfoKeys = Object.keys(storyDetails["general_info"]);
            const missingProperties = requiredProperties.filter(prop => !generalInfoKeys.includes(prop));
            if (missingProperties.length === 0) {
                //  if (storyDetails["prompts"]) {
                //     const prompts = storyDetails["prompts"];
                //     if (Array.isArray(prompts) ) {
                        return true;
                //     }
                
                //  }
            }
        }
    }
    if (storyDetails && storyDetails["type_of_story"] === "teammates_story") {
        const requiredProperties = [
            "teammates_memory",
            "teammates_names",
            // "general_notes"
        ];

        if (storyDetails["general_info"]) {
            const generalInfoKeys = Object.keys(storyDetails["general_info"]);
            const missingProperties = requiredProperties.filter(prop => !generalInfoKeys.includes(prop));
            if (missingProperties.length === 0) {
                // if (storyDetails["prompts"]) {
                //    const prompts = storyDetails["prompts"];
                //    if (Array.isArray(prompts) ) {
                       return true;
                //    }
               
                // }
           }
        }
    }
    if (storyDetails && storyDetails["type_of_story"] === "none_of_this_story") {
        const requiredProperties = [
            "name_of_event",
            "location_event",
            "people_involved",
            "general_notes"
        ];
        

        if (storyDetails["general_info"]) {
            const generalInfoKeys = Object.keys(storyDetails["general_info"]);
            const missingProperties = requiredProperties.filter(prop => !generalInfoKeys.includes(prop));
            if (missingProperties.length === 0) {
                // if (storyDetails["prompts"]) {
                //    const prompts = storyDetails["prompts"];
                //    if (Array.isArray(prompts) ) {
                       return true;
                //    }
               
                // }
           }
        }
    }
    if (storyDetails && storyDetails["type_of_story"] === "custom_event") {
        const requiredProperties = [
            "name_of_event",
            "location_event",
            "people_involved",
            "general_notes"
        ];
        

        if (storyDetails["general_info"]) {
            const generalInfoKeys = Object.keys(storyDetails["general_info"]);
            const missingProperties = requiredProperties.filter(prop => !generalInfoKeys.includes(prop));
            if (missingProperties.length === 0) {
                if (storyDetails["prompts"]) {
                   const prompts = storyDetails["prompts"];
                   if (Array.isArray(prompts) ) {
                       return true;
                   }
               
                }
           }
        }
    }
    const emptyObject = storyDetails && Object.keys(storyDetails).length === 0;
    if (emptyObject) {
        return true;
    }
    return false;
}
