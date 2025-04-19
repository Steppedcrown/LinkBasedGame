
class Start extends Scene {
    create() {
        this.engine.setTitle(this.engine.storyData.Title); // find the story title
        this.engine.addChoice("Begin the story");
        this.engine.guards = 0; // initialize the guards counter
        this.engine.defeatedEnemies = 0; // initialize the defeated enemies counter
        this.engine.maxEnemies = 2; // max enemy encounters
        this.engine.captured = false; // initialize captured tracker
        this.engine.once = true; // repeat ending once only
        this.engine.flags = {}; // initialize the flags object

        // Set default flags to true
        this.engine.flags["noGuards1"] = true;
        this.engine.flags["noGuards2"] = true;
        this.engine.flags["noNote"] = true;
        this.engine.flags["courtEnemies"] = true;
    }

    handleChoice() {
        this.engine.gotoScene(Location, this.engine.storyData.InitialLocation); // initial location of the story
    }
}

class Location extends Scene {
    create(key) {
        let locationData = this.engine.storyData.Locations[key]; // use `key` to get the data object for the current story location
        
        if (!this.engine.captured) {
            // Conditional messages
            let messageShown = false;
            const extraMessages = this.engine.storyData.ConditionalMessages || [];
            for (let msg of extraMessages) {
                if (this.engine.flags[msg.Flag] && key === msg.Location) { // If the flag is set and the location matches
                    this.engine.show(msg.Message); // display conditional message
                    messageShown = true; // register that a message of shown
                    break; // stop the loop after the first match
                }
            }
            if (!messageShown) {
                //console.log(locationData);
                this.engine.show(locationData.Body); // body of the location data
            }

            // Conditional choices
            const extraChoices = this.engine.storyData.ConditionalChoices || [];
            for (let c of extraChoices) {
                if (this.engine.flags[c.Flag] && key === c.Location) { // If the flag is set and the location matches
                    if (!this.engine.flags[c.Choice.SetFlag]) { // If the choice does not have a SetFlag property
                        this.engine.addChoice(c.Choice.Text, c.Choice); // add found choice
                        //console.log(c);
                        break; // Stop after the first match
                    }
                }
            }
        }
        
        if(!this.engine.captured && locationData.Choices) { // check if the location has any Choices and player has not been captured
            for(let choice of locationData.Choices) { // loop over the location's Choices
                this.engine.addChoice(choice.Text, choice); // use the Text of the choice
                // add a useful second argument to addChoice so that the current code of handleChoice below works
            }
        } else if (this.engine.once) { // Display final game details
            this.engine.once = false;
            this.endstats();
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
            if (choice.gainGuards) {
                this.engine.guards++;
                //console.log(`Guards decreased by ${choice.loseGuards}. Current guards: ${this.engine.guards}`);
            } else if (choice.loseGuards) {
                if (this.engine.guards > 0) { // if player has guards
                    this.engine.guards--; // lose some guards
                    this.engine.defeatedEnemies++; // and defeat the enemies
                    //console.log(`Guards decreased by ${choice.loseGuards}. Current guards: ${this.engine.guards}`);
                } else { // If player has no guards, get captured, display message, end stats, and goto end
                    this.engine.show(this.engine.storyData.CapturedMessage);
                    this.engine.captured = true;
                    this.engine.gotoScene(Location, "City Outskirts");
                }
                if (!this.engine.captured) { // so long as player didnt get captured
                    if (this.engine.guards <= 0) { // if they have no guards
                        this.engine.show(choice.loseGuards.loseText); // show the text that they lost their guards
                    } else {
                        this.engine.show(choice.loseGuards.winText); // otherwise show that they defeated the enemies with only some casualties
                    }
                }
            } else if (choice.stealthCheck) { // if there is a stealth check on current choice
                if (this.engine.guards > 0) { // and player has guards
                    this.engine.guards--; // lose guards
                    this.engine.show(choice.stealthCheck.failText); // and fail stealth check and fight enemies to escape
                } else {
                    this.engine.show(choice.stealthCheck.passText); // otherwise pass undetected
                }
            }
            this.engine.gotoScene(Location, choice.Target); // go to next location if one exists
        } else {
            this.engine.gotoScene(End); // otherwise go to end screen
        }
    }

    endstats() {
        this.engine.show(
            "You have escaped the city with " + this.engine.guards + " groups of guards " +
            "and you defeated " + this.engine.defeatedEnemies + " enemies, leaving " +
            (this.engine.maxEnemies - this.engine.defeatedEnemies) + " group to take the castle."
        );
    }
}

class End extends Scene {
    create() {
        this.engine.show("<hr>");
        this.engine.show(this.engine.storyData.Credits);
    }
}

Engine.load(Start, 'myStory.json');