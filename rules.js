
class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title); // find the story title
        this.engine.addChoice("Begin the story");
        this.engine.guards = 0; // initialize the guards counter
        this.engine.flags = {}; // initialize the flags object

        // Set default flags to true
        this.engine.flags["noGuards1"] = true;
        this.engine.flags["noGuards2"] = true;
        //this.engine.flags["hadMaxGuards"] = true;
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation); // initial location of the story
    }
}

class Location extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key]; // use `key` to get the data object for the current story location
        this.engine.show(locationData.Body); // body of the location data

        // Conditional messages
        const extraMessages = this.engine.storyData.ConditionalMessages || [];
        for (let msg of extraMessages) {
            if (this.engine.flags[msg.Flag] && key === msg.Location) { // If the flag is set and the location matches
                this.engine.show(msg.Message);
                break; // stop the loop after the first match
            }
        }

        // Conditional choices
        const extraChoices = this.engine.storyData.ConditionalChoices || [];
        for (let c of extraChoices) {
            if (this.engine.flags[c.Flag] && key === c.Location) { // If the flag is set and the location matches
                if (!this.engine.flags[c.Choice.SetFlag]) { // If the choice does not have a SetFlag property
                    this.engine.addChoice(c.Choice.Text, c.Choice);
                    console.log(c);
                    break; // Stop after the first match
                }
            }
        }

        // Update the guards status
       if (this.engine.guards > 0) {
            this.engine.flags["hasGuards"] = true;
            console.log(this.engine.guards);
        } else {
            this.engine.flags["hasGuards"] = true;
            console.log(this.engine.guards);
        }
        
        if(locationData.Choices) { // check if the location has any Choices
            for(let choice of locationData.Choices) { // loop over the location's Choices
                this.engine.addChoice(choice.Text, choice); // use the Text of the choice
                // add a useful second argument to addChoice so that the current code of handleChoice below works
            }
        } else {
            this.engine.addChoice("The end.")
        }
    }

    handleChoice(choice) {
        if(choice) {
            this.engine.show("&gt; "+choice.Text);
            this.engine.show("<br>");

            // Set boolean flags if the choice has a SetFlag property
            if (choice.SetFlag) {
                this.engine.flags[choice.SetFlag] = true;
                //console.log(`Flag ${choice.SetFlag} set to ${this.engine.flags[choice.SetFlag]}`);
            }

            // Gain or lose guards if the choice has a GainGuards or LoseGuards property
            if (choice.loseGuards && this.engine.guards > 0) {
                this.engine.guards--;
                //console.log(`Guards decreased by ${choice.loseGuards}. Current guards: ${this.engine.guards}`);
            } else if (choice.gainGuards) {
                this.engine.guards++;
                //console.log(`Guards increased by ${choice.gainGuards}. Current guards: ${this.engine.guards}`);
            }
            this.engine.gotoScene(Location, choice.Target);
        } else {
            this.engine.gotoScene(End);
        }
    }
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');