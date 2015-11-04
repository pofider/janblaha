{{{
    "title"    : "Attach existing EBS volume to Elastic Beanstalk",	
    "date"     : "09-10-2015 14:09",
    "tags"     :[ "AWS" ]
}}}

Such a very common thing like adding an existing external volume to Amazon elastic beanstalk is not easily supported out of the box. The official [blog](https://blogs.aws.amazon.com/application-management/post/Tx224DU59IG3OR9/Customize-Ephemeral-and-EBS-Volumes-in-Elastic-Beanstalk-Environments) mentions only how to attach a snapshot or how to attach and overwrite a new volume every time the service starts. It took me a while to make the config file actually adding an existing volume without formatting it every time so I share it here with you...

<script src="https://gist.github.com/pofider/17a096358e4fe34ca39f.js"></script>

##Notes

1. Replace `vol-ddb08e34` with your volume id
2. Replace `eu-central-1`  with volume and Elastic Beanstalk instance region
3. Make sure the Elastic Beanstalk has the same custom region in the scaling configuration as the EBS volume. You can do this only manually after the service is deployed for the first time.
4. Open AWS console and navigate to IAM > Roles > aws-elasticbeanstalk-ec2-role. There you should attach AdministratorAccess policy so the service can attach to the volume
