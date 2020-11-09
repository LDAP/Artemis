package de.tum.in.www1.artemis.service;

import java.util.HashSet;
import java.util.Set;

import org.springframework.stereotype.Service;

import de.tum.in.www1.artemis.domain.*;
import de.tum.in.www1.artemis.domain.enumeration.AchievementRank;
import de.tum.in.www1.artemis.domain.enumeration.AchievementType;
import de.tum.in.www1.artemis.repository.AchievementRepository;

@Service
public class TimeBasedAchievementService {

    private final AchievementRepository achievementRepository;

    private final static long DAYS_GOLD = 1L;

    private final static long DAYS_SILVER = 2L;

    private final static long DAYS_BRONZE = 3L;

    private final static long DAYS_UNRANKED = 4L;

    private final static long MIN_SCORE_TO_QUALIFY = 50L;

    public TimeBasedAchievementService(AchievementRepository achievementRepository) {
        this.achievementRepository = achievementRepository;
    }

    /**
     * Generates all time based achievements for a course
     * @param course
     */
    public void generateAchievements(Course course) {
        Set<Achievement> achievementsToSave = new HashSet<>();
        achievementsToSave.add(new Achievement("Time Master", "Hand in your submission within " + DAYS_GOLD + " day(s) after the release of an exercise", "calendar-check",
                AchievementRank.GOLD, AchievementType.TIME, DAYS_GOLD, MIN_SCORE_TO_QUALIFY, course, null));
        achievementsToSave.add(new Achievement("Time Intermediate", "Hand in your submission within " + DAYS_SILVER + " days after the release of an exercise", "calendar-check",
                AchievementRank.SILVER, AchievementType.TIME, DAYS_SILVER, MIN_SCORE_TO_QUALIFY, course, null));
        achievementsToSave.add(new Achievement("Time Beginner", "Hand in your submission within " + DAYS_BRONZE + " days after the release of an exercise", "calendar-check",
                AchievementRank.BRONZE, AchievementType.TIME, DAYS_BRONZE, MIN_SCORE_TO_QUALIFY, course, null));
        achievementsToSave.add(new Achievement("Time Amateur", "Hand in your submission within " + DAYS_UNRANKED + " days after the release of an exercise", "calendar-check",
                AchievementRank.UNRANKED, AchievementType.TIME, DAYS_UNRANKED, MIN_SCORE_TO_QUALIFY, course, null));

        achievementRepository.saveAll(achievementsToSave);
    }
}