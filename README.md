The contents of this repository are meant to be shared between Adam Higerd and Kuali.
This project is not open-source.

# Kuali Research Coding Interview

* Applicant's Name: Adam Higerd
* Programming Language: Javascript
* Approximate Starting Time: 11:45 AM CDT

Thank you for giving me the opportunity to apply with you.

# Comments

I noticed that the simulator is not required to check to see if the elevator is going in the right direction when
checking for candidates that will pass by the requested floor. All real elevators I've seen make this check, and I have
opted to include this in my implementation because it is more realistic, more efficient, and also simpler to implement
given the structures I've designed.

The instructions are not clear on what defines a "trip". I have chosen to define it as a passenger getting on, riding,
and getting off, but there are other definitions that could also be meaningful -- for example, this definition does not
account for travel done by an empty elevator.

I had a phone call come in while I was working on it, so that added an unexpected delay to getting it done. I know the
commit timeline is going to look like I spent more than two hours on it but I don't think actual time spent in front of
the keyboard will have gone very far over.

I realized as I was putting what I thought were the finishing touches on the code that I failed to account for people
waiting for an elevator that's going out of service. If this code were to become a full product, that would need to
be taken into account.

Running the simulation with a large number of elevators demonstrates a potential flaw with the strategy outlined in the
document: Higher-numbered elevators may take quite some time before they begin to be used, even if it would result in
passengers being serviced sooner on average. This could be addressed by giving elevators a "home floor" that they start
on and return to if they remain idle for too long, as well as by introducing some weighting to deprioritize elevators
that have serviced more passengers.
